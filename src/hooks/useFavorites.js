import { useEffect, useState } from 'react';
import { read, save } from '../utils/storage.js';
export const FAVORITES_KEY = 'hm1864.favorites';
export function cleanFavorites(value) {
  return Array.isArray(value) ? [...new Set(value.filter(key => typeof key === 'string' && key.length > 0 && key.length < 200))].slice(0, 1000) : [];
}
export function useFavorites() {
  const [keys, setKeys] = useState(() => cleanFavorites(read(FAVORITES_KEY, [])));
  useEffect(() => { save(FAVORITES_KEY, keys); }, [keys]);
  return { keys, toggle: key => setKeys(previous => previous.includes(key) ? previous.filter(item => item !== key) : cleanFavorites([...previous, key])) };
}
