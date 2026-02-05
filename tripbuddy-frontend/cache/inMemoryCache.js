const cache = {};
export const setCache = (key, data, ttl) => {
  cache[key] = { data, expiry: Date.now() + ttl };
};
export const getCache = (key) => {
  const item = cache[key];
  if (!item || item.expiry < Date.now()) return null;
  return item.data;
};
