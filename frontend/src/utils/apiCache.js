/**
 * apiCache.js — Production-grade API cache layer for School ERP
 *
 * Strategy: Stale-While-Revalidate (SWR)
 * - On first request: fetch from server, cache response
 * - On revisit: return cache INSTANTLY, then refresh in background
 * - On mutation (POST/PUT/DELETE): invalidate related cache entries
 * - Deduplication: concurrent requests to the same URL share one in-flight promise
 */

// ─── Cache Store ─────────────────────────────────────────────────────────────
const cache = new Map();                    // url → { data, timestamp, etag }
const inFlight = new Map();                 // url → Promise (deduplication)

// ─── TTL Configuration (per endpoint pattern) ─────────────────────────────
const TTL_CONFIG = [
  { pattern: /\/api\/school$/,              ttl: 300_000 },  // 5 min — school profile rarely changes
  { pattern: /\/api\/grades/,               ttl: 120_000 },  // 2 min — grade list
  { pattern: /\/api\/sections/,             ttl: 120_000 },  // 2 min
  { pattern: /\/api\/academics\/subjects/,  ttl: 60_000  },  // 1 min
  { pattern: /\/api\/academics\/timeslots/, ttl: 120_000 },  // 2 min
  { pattern: /\/api\/platform\/analytics/,  ttl: 30_000  },  // 30 sec — analytics
  { pattern: /\/api\/academics\//,          ttl: 45_000  },  // 45 sec — academic data
  { pattern: /\/api\/students/,             ttl: 30_000  },  // 30 sec — student directory
  { pattern: /\/api\/teachers/,             ttl: 30_000  },  // 30 sec
  { pattern: /\/api\/staff/,                ttl: 30_000  },  // 30 sec
  { pattern: /\/api\/fees/,                 ttl: 20_000  },  // 20 sec — financial data
  { pattern: /\/api\/expenses/,             ttl: 20_000  },  // 20 sec
  { pattern: /\/api\/payroll/,              ttl: 20_000  },  // 20 sec
  { pattern: /\/api\/attendance/,           ttl: 15_000  },  // 15 sec — attendance
  { pattern: /\/api\/results/,              ttl: 30_000  },  // 30 sec
  { pattern: /\/api\/roles/,                ttl: 60_000  },  // 1 min
];

const DEFAULT_TTL = 30_000; // 30 seconds default

function getTtl(url) {
  for (const { pattern, ttl } of TTL_CONFIG) {
    if (pattern.test(url)) return ttl;
  }
  return DEFAULT_TTL;
}

function isFresh(entry, url) {
  if (!entry) return false;
  const ttl = getTtl(url);
  return (Date.now() - entry.timestamp) < ttl;
}

function isStale(entry, url) {
  if (!entry) return false;
  const ttl = getTtl(url);
  const elapsed = Date.now() - entry.timestamp;
  // Consider stale after TTL but within 5x TTL (after that it's "very stale")
  return elapsed >= ttl && elapsed < ttl * 5;
}

// ─── Cache Invalidation ────────────────────────────────────────────────────
const INVALIDATION_MAP = {
  '/api/students':              [/\/api\/students/],
  '/api/teachers':              [/\/api\/teachers/, /\/api\/platform\/analytics/],
  '/api/staff':                 [/\/api\/staff/, /\/api\/platform\/analytics/],
  '/api/school':                [/\/api\/school/],
  '/api/fees':                  [/\/api\/fees/],
  '/api/expenses':              [/\/api\/expenses/],
  '/api/payroll':               [/\/api\/payroll/],
  '/api/attendance':            [/\/api\/attendance/],
  '/api/academics/timetables':  [/\/api\/academics\/timetables/, /\/api\/academics\/published/],
  '/api/academics/exams':       [/\/api\/academics\/exams/, /\/api\/academics\/exam-timetables/],
  '/api/academics/subjects':    [/\/api\/academics\/subjects/, /\/api\/academics\/grades-sections/],
  '/api/academics/results':     [/\/api\/academics\/results/],
  '/api/grades':                [/\/api\/grades/, /\/api\/academics\/grades-sections/],
  '/api/roles':                 [/\/api\/roles/, /\/api\/user-access/],
};

export function invalidateCache(urlPatternOrBase) {
  const base = urlPatternOrBase.split('?')[0];
  let patterns = [];

  // Find matching invalidation rules
  for (const [key, pats] of Object.entries(INVALIDATION_MAP)) {
    if (base.includes(key)) {
      patterns.push(...pats);
    }
  }

  // Always also invalidate the exact URL
  patterns.push(new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  let invalidated = 0;
  for (const [cachedUrl] of cache) {
    if (patterns.some(p => p.test(cachedUrl))) {
      cache.delete(cachedUrl);
      invalidated++;
    }
  }

  if (invalidated > 0 && process.env.NODE_ENV === 'development') {
    console.debug(`[ApiCache] Invalidated ${invalidated} cached entries for: ${base}`);
  }
}

// ─── Background Refresh ────────────────────────────────────────────────────
const pendingRefresh = new Set();

async function backgroundRefresh(url, fetchOptions) {
  if (pendingRefresh.has(url)) return;
  pendingRefresh.add(url);

  try {
    const response = await fetch(url, { ...fetchOptions, cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const etag = response.headers.get('ETag') || null;
      cache.set(url, { data, timestamp: Date.now(), etag });
    }
  } catch (e) {
    // Silent — background refresh failure should not surface errors
  } finally {
    pendingRefresh.delete(url);
  }
}

import perfMonitor from './perfMonitor.js';

// ─── Core cachedFetch ─────────────────────────────────────────────────────
/**
 * Drop-in replacement for fetch() with cache-first strategy.
 * 
 * @param {string} url — API endpoint
 * @param {RequestInit} [options] — fetch options
 * @param {object} [cacheOptions]
 * @param {boolean} [cacheOptions.skipCache] — bypass cache for this call
 * @param {boolean} [cacheOptions.forceRefresh] — fetch fresh data even if cache is valid
 * @returns {Promise<Response>} — same interface as fetch()
 */
export async function cachedFetch(url, options = {}, cacheOptions = {}) {
  const startTime = performance.now();
  const method = (options.method || 'GET').toUpperCase();

  // Only cache GET requests
  if (method !== 'GET') {
    const response = await fetch(url, options);
    if (response.ok) {
      // Invalidate related cache entries after a successful mutation
      invalidateCache(url);
    }
    return response;
  }

  if (cacheOptions.skipCache || cacheOptions.forceRefresh) {
    const response = await fetch(url, { ...options, cache: 'no-store' });
    const duration = performance.now() - startTime;
    perfMonitor.logApiRequest(url, duration, false);
    if (response.ok) {
      const data = await response.json();
      const etag = response.headers.get('ETag') || null;
      cache.set(url, { data, timestamp: Date.now(), etag });
      return new CachedResponse(data, response.status, response.headers);
    }
    return response;
  }

  const cached = cache.get(url);

  // ── Case 1: Fresh cache → return instantly ─────────────────────────────
  if (cached && isFresh(cached, url)) {
    const duration = performance.now() - startTime;
    perfMonitor.logApiRequest(url, duration, true);
    return new CachedResponse(cached.data, 200);
  }

  // ── Case 2: Stale cache → return stale immediately, refresh in background
  if (cached && isStale(cached, url)) {
    const duration = performance.now() - startTime;
    perfMonitor.logApiRequest(url, duration, true);
    backgroundRefresh(url, options);
    return new CachedResponse(cached.data, 200);
  }

  // ── Case 3: No cache or very stale → deduplicate in-flight requests ────
  if (inFlight.has(url)) {
    return inFlight.get(url);
  }

  const fetchPromise = (async () => {
    try {
      // Add ETag header for conditional requests if we have one
      const headers = { ...(options.headers || {}) };
      if (cached?.etag) {
        headers['If-None-Match'] = cached.etag;
      }

      const response = await fetch(url, { ...options, headers });
      const duration = performance.now() - startTime;

      // 304 Not Modified — cached data is still good
      if (response.status === 304 && cached) {
        cache.set(url, { ...cached, timestamp: Date.now() });
        perfMonitor.logApiRequest(url, duration, true);
        return new CachedResponse(cached.data, 200);
      }

      perfMonitor.logApiRequest(url, duration, false);

      if (response.ok) {
        const data = await response.json();
        const etag = response.headers.get('ETag') || null;
        cache.set(url, { data, timestamp: Date.now(), etag });
        return new CachedResponse(data, response.status, response.headers);
      }

      return response;
    } finally {
      inFlight.delete(url);
    }
  })();

  inFlight.set(url, fetchPromise);
  return fetchPromise;
}

// ─── CachedResponse — mimics the fetch Response interface ─────────────────
class CachedResponse {
  constructor(data, status = 200, headers = null) {
    this._data = data;
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this.headers = headers || new Headers({ 'Content-Type': 'application/json' });
    this.fromCache = true;
  }
  async json() { return this._data; }
  async text() { return JSON.stringify(this._data); }
  clone() { return new CachedResponse(this._data, this.status, this.headers); }
}

// ─── Prefetching ──────────────────────────────────────────────────────────
const MODULE_PREFETCH_MAP = {
  'students':    ['/api/students?page=1&limit=8&class=All&status=All', '/api/grades/active', '/api/sections/active'],
  'teachers':    ['/api/teachers?limit=50&status=All'],
  'staff':       ['/api/staff'],
  'academics':   ['/api/academics/timetables', '/api/academics/exams', '/api/academics/subjects', '/api/academics/grades-sections', '/api/academics/timeslots'],
  'attendance':  ['/api/attendance'],
  'fees':        ['/api/fees', '/api/fee-structures'],
  'expenses':    ['/api/expenses'],
  'payroll':     ['/api/payroll'],
  'grades':      ['/api/grades', '/api/sections'],
  'roles':       ['/api/roles', '/api/user-access'],
  'overview':    ['/api/students?limit=1&status=All&class=All', '/api/teachers?limit=1&status=All', '/api/staff'],
};

/**
 * Warm the cache for a module's related endpoints.
 * Uses requestIdleCallback for non-blocking prefetch.
 */
export function prefetchModule(moduleKey) {
  const urls = MODULE_PREFETCH_MAP[moduleKey];
  if (!urls) return;

  const prefetch = () => {
    for (const url of urls) {
      if (!cache.has(url) || !isFresh(cache.get(url), url)) {
        cachedFetch(url).catch(() => {}); // fire-and-forget
      }
    }
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 100);
  }
}

/**
 * Prefetch common modules after login to warm the cache.
 * Runs on idle so it doesn't compete with the initial render.
 */
export function prefetchOnLogin() {
  const modules = ['overview', 'students', 'teachers', 'grades'];
  let delay = 500;
  for (const mod of modules) {
    setTimeout(() => prefetchModule(mod), delay);
    delay += 800;
  }
}

// ─── Cache Stats (dev-mode only) ─────────────────────────────────────────
export function getCacheStats() {
  const stats = { entries: cache.size, inFlight: inFlight.size, details: [] };
  for (const [url, entry] of cache) {
    stats.details.push({
      url,
      age: Math.round((Date.now() - entry.timestamp) / 1000) + 's',
      fresh: isFresh(entry, url),
      stale: isStale(entry, url),
    });
  }
  return stats;
}

export function clearCache() {
  cache.clear();
  inFlight.clear();
}
