import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAsyncCache = async (key, data, ttl) => {
  // Add null checks
  if (!key || key === null || key === undefined) {
    console.warn('AsyncStorage: Invalid key provided');
    return;
  }
  
  if (data === null || data === undefined) {
    console.warn('AsyncStorage: Invalid data provided');
    return;
  }

  const obj = { data, expiry: Date.now() + ttl };
  try {
    await AsyncStorage.setItem(String(key), JSON.stringify(obj));
  } catch (e) {
    console.warn('AsyncStorage set error', e);
  }
};

export const getAsyncCache = async (key) => {
  // Add null check for key
  if (!key || key === null || key === undefined) {
    console.warn('AsyncStorage: Invalid key provided');
    return null;
  }

  try {
    const json = await AsyncStorage.getItem(String(key));
    if (!json) return null;
    const obj = JSON.parse(json);
    if (obj.expiry < Date.now()) {
      await AsyncStorage.removeItem(String(key));
      return null;
    }
    return obj.data;
  } catch (e) {
    console.warn('AsyncStorage get error', e);
    return null;
  }
};
