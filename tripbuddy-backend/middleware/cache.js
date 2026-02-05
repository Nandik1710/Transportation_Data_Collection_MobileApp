const NodeCache = require('node-cache');

// Create cache instances with different TTLs
const flightCache = new NodeCache({ 
  stdTTL: 1800, // 30 minutes
  checkperiod: 120 // Check for expired keys every 2 minutes
});

const trainCache = new NodeCache({ stdTTL: 3600 }); // 1 hour
const busCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const carCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

function cacheMiddleware(req, res, next) {
  // Only cache GET and POST requests
  if (!['GET', 'POST'].includes(req.method)) return next();

  const { source, destination, date, mode } = req.body || req.query;
  if (!source || !destination || !mode) return next();

  // Create cache key
  const cacheKey = `${mode}_${source.toLowerCase()}_${destination.toLowerCase()}_${date || 'no-date'}`;
  
  // Select appropriate cache based on mode
  let cache;
  switch (mode) {
    case 'flights':
      cache = flightCache;
      break;
    case 'trains':
      cache = trainCache;
      break;
    case 'buses':
      cache = busCache;
      break;
    case '4wheelers':
      cache = carCache;
      break;
    default:
      cache = flightCache;
  }

  // Try to get cached data
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Cache hit for:', cacheKey);
    return res.json({ 
      source: 'cache', 
      results: cached,
      cached: true,
      timestamp: new Date().toISOString()
    });
  }

  console.log('Cache miss for:', cacheKey);

  // Attach cache utilities for use in controller
  req.cacheUtils = { 
    cacheKey, 
    cache,
    set: (data) => {
      if (data && data.length > 0) {
        console.log('Caching data for:', cacheKey, `(${data.length} items)`);
        cache.set(cacheKey, data);
      }
    }
  };

  next();
}

// Utility function to clear specific cache
function clearCache(mode, source = null, destination = null) {
  let cache;
  switch (mode) {
    case 'flights':
      cache = flightCache;
      break;
    case 'trains':
      cache = trainCache;
      break;
    case 'buses':
      cache = busCache;
      break;
    case '4wheelers':
      cache = carCache;
      break;
  }

  if (source && destination) {
    const pattern = `${mode}_${source.toLowerCase()}_${destination.toLowerCase()}`;
    const keys = cache.keys().filter(key => key.startsWith(pattern));
    cache.del(keys);
    console.log(`Cleared ${keys.length} cache entries for ${pattern}`);
  } else {
    cache.flushAll();
    console.log(`Cleared all ${mode} cache`);
  }
}

module.exports = { cacheMiddleware, clearCache };
