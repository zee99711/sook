import { base44 } from "@/api/base44Client";

const DEFAULTS = { cod: 0.03, usdt: 0.02, shamcash: 0.025, syrcash: 0.025, tax: 0 };
let cache = null;

export async function getCommissions() {
  if (cache) return cache;
  try {
    const recs = await base44.entities.AppSetting.list();
    if (recs && recs[0]) {
      cache = {
        cod: recs[0].cod_rate ?? DEFAULTS.cod,
        usdt: recs[0].usdt_rate ?? DEFAULTS.usdt,
        shamcash: recs[0].shamcash_rate ?? DEFAULTS.shamcash,
        syrcash: recs[0].syrcash_rate ?? DEFAULTS.syrcash,
        tax: recs[0].tax_rate ?? DEFAULTS.tax,
        settingId: recs[0].id,
      };
      return cache;
    }
  } catch {
    // تجاهل
  }
  cache = { ...DEFAULTS, settingId: null };
  return cache;
}

export function clearCommissionCache() {
  cache = null;
}

const RATE_BY_METHOD = { cod: "cod", usdt: "usdt", shamcash: "shamcash", syrcash: "syrcash" };

export function rateFor(methodId, c) {
  const key = RATE_BY_METHOD[methodId];
  return key ? c[key] : 0;
}

// المجموع: المشتري يدفع (subtotal + commission + tax)؛ التاجر يستحق (subtotal).
export function orderTotals(subtotal, methodId, c) {
  const rate = rateFor(methodId, c);
  const commission = subtotal * rate;
  const tax = subtotal * (c.tax || 0);
  const total = subtotal + commission + tax;
  const net = subtotal; // صافي مستحقات التاجر بعد خصم العمولة
  return { subtotal, commission, tax, total, net, rate };
}