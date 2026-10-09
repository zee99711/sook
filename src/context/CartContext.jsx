// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'sook-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // حفظ تلقائي
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id
            ? { ...it, qty: it.qty + qty }
            : it
        );
      }
      return [...prev, { product, qty }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeItem(productId);
    setItems((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, qty } : it))
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  // تجميع حسب التاجر
  const itemsByMerchant = () => {
    const groups = {};
    items.forEach((it) => {
      const mid = it.product.merchant_id;
      if (!groups[mid]) groups[mid] = [];
      groups[mid].push(it);
    });
    return groups;
  };

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.product.price) * it.qty,
    0
  );

  const count = items.reduce((sum, it) => sum + it.qty, 0);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    itemsByMerchant,
    subtotal,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}