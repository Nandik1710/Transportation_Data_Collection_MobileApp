// import { useState, useEffect, useCallback } from 'react';

// export function useCachedApi(key, fetcher, enabled = true) {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchData = useCallback(async () => {
//     if (!key || !fetcher || !enabled) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const result = await fetcher();
//       setData(result);
//     } catch (err) {
//       console.error('API fetch error:', err);
//       setError(err.message || 'Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   }, [key, fetcher, enabled]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const refetch = useCallback(() => {
//     fetchData();
//   }, [fetchData]);

//   return { data, loading, error, refetch };
// }
