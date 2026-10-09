// src/lib/commissions.js
import { settingsAPI } from '@/api/entities';

const DEFAULTS = {
  cod: 0.03,
  usdt: 0.02,
  shamcash: 0.025,
  syrcash: 0.025,
  tax: 0,
};

let cache = null;

export async function getCommissions() {
  if (cache) return cache;

  try {
    const rec = await settingsAPI.get();
    if (rec) {
      cache = {
        cod: rec.cod_rate ?? DEFAULTS.cod,
        usdt: rec.usdt_rate ?? DEFAULTS.usdt,
        shamcash: rec.shamcash_rate ?? DEFAULTS.shamcash,
        syrcash: rec.syrcash_rate ?? DEFAULTS.syrcash,
        tax: rec.tax_rate ?? DEFAULTS.tax,
        settingId: rec.id,
      };
      return cache;
    }
  } catch (err) {
    console.warn('Failed to load commissions, using defaults:', err);
  }

  cache = { ...DEFAULTS, settingId: null };
  return cache;
}

export function clearCommissionCache() {
  cache = null;
}

const RATE_BY_METHOD = {
  cod: 'cod',
  usdt: 'usdt',
  shamcash: 'shamcash',
  syrcash: 'syrcash',
};

export function rateFor(methodId, c) {
  const key = RATE_BY_METHOD[methodId];
  return key ? c[key] : 0;
}

// المجموع: المشتري يدفع (subtotal + commission + tax)؛ التاجر يستحق (subtotal)
export function orderTotals(subtotal, methodId, c) {
  const rate = rateFor(methodId, c);
  const commission = subtotal * rate;
  const tax = subtotal * (c.tax || 0);
  const total = subtotal + commission + tax;
  const net = subtotal; // صافي مستحقات التاجر
  return { subtotal, commission, tax, total, net, rate };
}