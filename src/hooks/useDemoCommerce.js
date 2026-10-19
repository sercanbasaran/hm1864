import { useEffect, useMemo, useRef, useState } from 'react';
import { read, save } from '../utils/storage.js';
import { cartRows, cleanCart, lineId } from '../commerce.js';
import { choice, validPrice } from '../model.js';

export function useDemoCommerce(data, currency) {
  const [items, setItems] = useState(() => cleanCart(read('hm1864.demo.cart', [])));
  const [user, setUser] = useState(null), [orders, setOrders] = useState([]);
  const accounts = useRef(new Map());
  const rows = useMemo(() => cartRows(items, data, currency), [items, data, currency]);
  useEffect(() => save('hm1864.demo.cart', items), [items]);
  const addToCart = (product, variant, quantity) => {
    const selected = choice(product, variant, currency);
    if (selected.onlineSale === false || !validPrice(selected.price) || (selected.stock != null && selected.stock < quantity)) return false;
    setItems(previous => cleanCart([...previous, { key: product.key, variant, quantity }]));
    return true;
  };
  const updateQuantity = (id, quantity) => {
    if (!Number.isInteger(quantity)) return;
    setItems(previous => quantity <= 0 ? previous.filter(item => lineId(item.key, item.variant) !== id) : previous.map(item => lineId(item.key, item.variant) === id ? { ...item, quantity: Math.min(99, quantity) } : item));
  };
  // Demonstration accounts exist only for this tab's lifetime. No credentials are persisted.
  const register = ({ name, email, password }) => {
    const key = email.trim().toLowerCase();
    if (key === 'demo@hm1864.com' || accounts.current.has(key)) return 'emailExists';
    accounts.current.set(key, { name: name.trim(), email: key, password });
    setUser({ name: name.trim(), email: key });
    return null;
  };
  const login = ({ email, password }) => {
    const key = email.trim().toLowerCase();
    const account = key === 'demo@hm1864.com' && password === 'Demo1864!' ? { name: 'Demo', email: key } : accounts.current.get(key);
    if (!account || (key !== 'demo@hm1864.com' && account.password !== password)) return 'loginError';
    setUser({ name: account.name, email: account.email });
    return null;
  };
  const completeOrder = order => {
    const result = { ...order, id: 'DEMO-' + crypto.randomUUID().slice(0, 8).toUpperCase(), createdAt: new Date().toISOString() };
    setOrders(previous => [result, ...previous]); setItems([]); return result;
  };
  return { items, rows, user, orders, addToCart, updateQuantity, register, login, logout: () => setUser(null), completeOrder,
    cartCount: items.reduce((sum, item) => sum + item.quantity, 0) };
}
