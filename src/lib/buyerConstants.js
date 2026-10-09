// src/lib/buyerConstants.js
// طرق الدفع وعمولاتها الإضافية (ثوابت للعرض فقط)
// القيم الفعلية تأتي من جدول app_settings في Supabase

export const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'دفع عند التسليم',
    commission: 0.03,
    icon: '💵',
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'usdt',
    label: 'محفظة USDT',
    commission: 0.02,
    icon: '₮',
    color: 'bg-teal-100 text-teal-800',
  },
  {
    id: 'shamcash',
    label: 'شام كاش',
    commission: 0.025,
    icon: '📱',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'syrcash',
    label: 'سيريتل كاش',
    commission: 0.025,
    icon: '📱',
    color: 'bg-pink-100 text-pink-800',
  },
];

export function methodById(id) {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function methodLabel(id) {
  return methodById(id)?.label || '—';
}

// ضريبة افتراضية 0 — القيمة الفعلية من app_settings
export const TAX_RATE = 0;

// حساب سريع بدون جلب من السيرفر (للعرض التقريبي فقط)
export function orderTotals(subtotal, methodId) {
  const method = methodById(methodId);
  const commission = method ? subtotal * method.commission : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + commission + tax;
  return { subtotal, commission, tax, total, methodLabel: method?.label || '—' };
}