// constants/index.js
import Constants from 'expo-constants';

const getExtraValue = (key, defaultValue) => {
  return Constants.expoConfig?.extra?.[key] || 
         Constants.manifest?.extra?.[key] || 
         Constants.manifest2?.extra?.[key] || 
         defaultValue;
};

export const BACKEND_URL = getExtraValue('BACKEND_URL', 'http://192.168.1.11:5000');
export const RATE_LIMIT = Number(getExtraValue('RATE_LIMIT', 85));
export const RATE_LIMIT_WINDOW_MS = Number(getExtraValue('RATE_LIMIT_WINDOW_MS', 60000));
export const CACHE_TTL_MS = Number(getExtraValue('CACHE_TTL_MS', 300000));
export const ASYNC_STORAGE_TTL_MS = Number(getExtraValue('ASYNC_STORAGE_TTL_MS', 86400000));
