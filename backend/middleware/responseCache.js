import { tenantStorage, slugify } from '../utils/db.js';

// Cache store: Map of key -> { body, headers, timestamp, contentType, etag }
const cacheStore = new Map();

// Helper to get active tenant ID
const getActiveTenantId = () => {
  return tenantStorage.getStore() || 'platform';
};

/**
 * responseCacheMiddleware(ttlSeconds)
 * Express middleware for response caching
 */
export const responseCacheMiddleware = (ttlSeconds = 30) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      // For mutations, intercept response to invalidate cache
      const originalSend = res.send;
      res.send = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const tenantId = getActiveTenantId();
          invalidateTenantCache(tenantId, req.originalUrl.split('?')[0]);
        }
        return originalSend.apply(this, arguments);
      };
      return next();
    }

    const tenantId = getActiveTenantId();
    const cacheKey = `${tenantId}:${req.originalUrl}`;
    const cached = cacheStore.get(cacheKey);

    // If cache hit and not expired
    if (cached && (Date.now() - cached.timestamp) < (ttlSeconds * 1000)) {
      res.setHeader('X-Cache', 'HIT');
      if (cached.contentType) {
        res.setHeader('Content-Type', cached.contentType);
      }
      if (cached.etag) {
        res.setHeader('ETag', cached.etag);
        // Check If-None-Match
        if (req.headers['if-none-match'] === cached.etag) {
          return res.status(304).end();
        }
      }
      return res.send(cached.body);
    }

    res.setHeader('X-Cache', 'MISS');

    // Intercept res.send to store response in cache
    const originalSend = res.send;
    res.send = function (body) {
      const contentType = res.get('Content-Type') || '';
      
      // Only cache successful GET responses that are JSON or HTML
      if (res.statusCode === 200 && (contentType.includes('application/json') || contentType.includes('text/html'))) {
        const hash = generateSimpleHash(body);
        const etag = `W/"${hash}"`;
        res.setHeader('ETag', etag);

        cacheStore.set(cacheKey, {
          body,
          timestamp: Date.now(),
          contentType,
          etag
        });

        // LRU Eviction: Limit cache size to 500 entries to prevent memory leaks
        if (cacheStore.size > 500) {
          const firstKey = cacheStore.keys().next().value;
          if (firstKey) cacheStore.delete(firstKey);
        }
      }

      return originalSend.apply(this, arguments);
    };

    next();
  };
};

/**
 * Invalidates cache entries for a given tenant matching a path/resource
 */
export const invalidateTenantCache = (tenantId, resourcePath) => {
  const segments = resourcePath.split('/').filter(Boolean);
  const resource = segments[1]; // e.g. "students" or "academics" or "school"

  let invalidated = 0;
  for (const key of cacheStore.keys()) {
    const [keyTenant, keyUrl] = key.split(':');
    if (keyTenant === tenantId) {
      const keySegments = keyUrl.split('?')[0].split('/').filter(Boolean);
      // Invalidate if the base resource matches (e.g. both relate to "students")
      if (keySegments[1] === resource || !resource) {
        cacheStore.delete(key);
        invalidated++;
      }
    }
  }

  if (invalidated > 0 && process.env.NODE_ENV === 'development') {
    console.debug(`[Response Cache] Invalidated ${invalidated} cached pages for tenant "${tenantId}" on resource "${resource || 'all'}"`);
  }
};

// Simple DJB2-like string hashing function for fast ETag generation
function generateSimpleHash(str) {
  const data = typeof str === 'string' ? str : JSON.stringify(str);
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 33) ^ data.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
