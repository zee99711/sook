// طرق الدفع وعمولاتها الإضافية
export const PAYMENT_METHODS = [
  { id: "cod", label: "دفع عند التسليم", commission: 0.03 },
  { id: "usdt", label: "محفظة USDT", commission: 0.02 },
  { id: "shamcash", label: "شام كاش", commission: 0.025 },
  { id: "syrcash", label: "سيريتل كاش", commission: 0.025 },
];

export function methodById(id) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

// ضريبة افتراضية 0 — قابلة للتعديل مستقبلاً
export const TAX_RATE = 0;

export function orderTotals(subtotal, methodId) {
  const method = methodById(methodId);
  const commission = method ? subtotal * method.commission : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + commission + tax;
  return { subtotal, commission, tax, total, methodLabel: method?.label || "—" };
}