import { getCache, setCache } from './inMemoryCache';
import { getAsyncCache, setAsyncCache } from './asyncStorageCache';
import { CACHE_TTL_MS, ASYNC_STORAGE_TTL_MS } from '../constants';

// Stale-while-revalidate cache: 
// Return cache if present then fetch latest update in background
export const getCachedData = async (key, fetcher) => {
  // Check for invalid key
  if (!key || key === null || key === undefined) {
    console.warn('Cache: Invalid key provided, fetching fresh data');
    try {
      return { data: await fetcher(), stale: false };
    } catch (error) {
      console.error('Error fetching fresh data:', error);
      return { data: null, stale: false };
    }
  }

  let cached = getCache(key);
  if (cached) {
    fetcher().then((freshData) => {
      if (freshData) {
        setCache(key, freshData, CACHE_TTL_MS);
        setAsyncCache(key, freshData, ASYNC_STORAGE_TTL_MS);
      }
    }).catch(console.error);
    return { data: cached, stale: true };
  }

  cached = await getAsyncCache(key);
  if (cached) {
    fetcher().then((freshData) => {
      if (freshData) {
        setCache(key, freshData, CACHE_TTL_MS);
        setAsyncCache(key, freshData, ASYNC_STORAGE_TTL_MS);
      }
    }).catch(console.error);
    return { data: cached, stale: true };
  }

  try {
    const freshData = await fetcher();
    if (freshData) {
      setCache(key, freshData, CACHE_TTL_MS);
      setAsyncCache(key, freshData, ASYNC_STORAGE_TTL_MS);
    }
    return { data: freshData, stale: false };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { data: null, stale: false };
  }
};
