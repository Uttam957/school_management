/**
 * Performance Monitor Utility
 * Tracks and reports page load paint metrics, API response latencies, and caching efficiency.
 */
class PerformanceMonitor {
  constructor() {
    this.apiMetrics = [];
    this.navigationMetrics = null;
    this.enabled = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

    if (typeof window !== 'undefined') {
      this.initPaintMetrics();
      this.initNavigationMetrics();
      window.perfMonitor = this;
    }
  }

  /**
   * Tracks standard paint metrics (FCP, LCP)
   */
  initPaintMetrics() {
    if (!this.enabled || !window.PerformanceObserver) return;

    try {
      // Paint entry observer (FCP)
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            console.debug(`[PerfMonitor] First Contentful Paint (FCP): ${entry.startTime.toFixed(2)}ms`);
          }
        });
      });
      paintObserver.observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint (LCP) observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.debug(`[PerfMonitor] Largest Contentful Paint (LCP): ${lastEntry.startTime.toFixed(2)}ms`);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('[PerfMonitor] Failed to initialize paint observer:', e);
    }
  }

  /**
   * Tracks navigation timing metrics
   */
  initNavigationMetrics() {
    if (!this.enabled) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const [navigation] = performance.getEntriesByType('navigation');
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.startTime;
            const domReady = navigation.domContentLoadedEventEnd - navigation.startTime;
            const dnsLookup = navigation.domainLookupEnd - navigation.domainLookupStart;
            const tcpConnect = navigation.connectEnd - navigation.connectStart;

            this.navigationMetrics = { loadTime, domReady, dnsLookup, tcpConnect };

            console.groupCollapsed('%c[PerfMonitor] Navigation Metrics', 'color: #3b82f6; font-weight: bold;');
            console.log(`Load Event Time: ${loadTime.toFixed(2)}ms`);
            console.log(`DOM Content Loaded: ${domReady.toFixed(2)}ms`);
            console.log(`DNS Lookup Duration: ${dnsLookup.toFixed(2)}ms`);
            console.log(`TCP Connect Duration: ${tcpConnect.toFixed(2)}ms`);
            console.groupEnd();
          }
        } catch (e) {
          console.warn('[PerfMonitor] Navigation timing extraction failed:', e);
        }
      }, 0);
    });
  }

  /**
   * Starts a performance mark for tracking API/transaction duration
   * @param {string} label - Unique identifier
   */
  startMark(label) {
    if (!this.enabled) return;
    performance.mark(`${label}-start`);
  }

  /**
   * Completes a performance mark and reports measured duration
   * @param {string} label - Unique identifier
   */
  endMark(label) {
    if (!this.enabled) return;
    try {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measures = performance.getEntriesByName(label);
      const lastMeasure = measures[measures.length - 1];
      
      if (lastMeasure) {
        console.debug(`[PerfMonitor] ${label} completed in ${lastMeasure.duration.toFixed(2)}ms`);
      }
      
      // Clean up markers
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    } catch (e) {
      // Ignore labeling trace errors
    }
  }

  /**
   * Logs a specific API request and tracks hits vs misses
   * @param {string} url - API Endpoint URL
   * @param {number} latencyMs - Duration in milliseconds
   * @param {boolean} cacheHit - Whether the SWR cache served this request
   */
  logApiRequest(url, latencyMs, cacheHit) {
    const cleanUrl = url.split('?')[0];
    this.apiMetrics.push({
      url: cleanUrl,
      latency: latencyMs,
      cacheHit,
      timestamp: Date.now()
    });

    // Prevent history array from leaking memory (limit to last 200 api queries)
    if (this.apiMetrics.length > 200) {
      this.apiMetrics.shift();
    }

    if (this.enabled) {
      const hitIndicator = cacheHit ? '%c[HIT]' : '%c[MISS]';
      const indicatorColor = cacheHit ? 'color: #10b981; font-weight: bold;' : 'color: #f59e0b; font-weight: bold;';
      console.log(
        `${hitIndicator} %c${cleanUrl}%c took %c${latencyMs.toFixed(0)}ms`,
        indicatorColor,
        'color: inherit; font-weight: 550;',
        'color: inherit;',
        'color: #3b82f6; font-weight: bold;'
      );
    }
  }

  /**
   * Prints aggregated API performance stats in developer console
   */
  printStats() {
    if (this.apiMetrics.length === 0) {
      console.log('[PerfMonitor] No API metrics recorded yet.');
      return;
    }

    const totalCalls = this.apiMetrics.length;
    const cacheHits = this.apiMetrics.filter(m => m.cacheHit).length;
    const hitRate = (cacheHits / totalCalls) * 100;

    const avgLatency = this.apiMetrics.reduce((sum, m) => sum + m.latency, 0) / totalCalls;

    console.group('%c[PerfMonitor] Summary Statistics', 'color: #8b5cf6; font-weight: bold; font-size: 110%;');
    console.log(`Total API Invocations: ${totalCalls}`);
    console.log(`Cache Hit Rate: ${hitRate.toFixed(1)}%`);
    console.log(`Average API Latency: ${avgLatency.toFixed(2)}ms`);
    console.table(this.apiMetrics.slice(-10)); // Display last 10 entries as a table
    console.groupEnd();
  }
}

export const perfMonitor = new PerformanceMonitor();
export default perfMonitor;
