import { base44 } from "@/api/base44Client";

// إشعار داخلي (كيان Notification)
export async function notifyInternal(userId, type, title, body) {
  if (!userId) return;
  try {
    await base44.entities.Notification.create({ user_id: userId, type, title, body, is_read: false });
  } catch {
    // تجاهل
  }
}

// إشعار واتساب عبر رابط مشاركة wa.me (دون الحاجة لرقم)
export function notifyWhatsApp(text) {
  try {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  } catch {
    // تجاهل
  }
}

const STATUS_MAP = {
  new_order: { type: "new_order", title: "طلب جديد", bodyFor: (m, inv) => `لديك طلب جديد ${inv.invoice_number} بقيمة ${inv.total} ر.س.` },
  confirmed: { type: "order_confirmed", title: "تم تأكيد طلبك", bodyFor: (m, inv) => `أكّد ${m} طلبك ${inv.invoice_number}.` },
  rejected: { type: "order_rejected", title: "تم رفض طلبك", bodyFor: (m, inv) => `رفض ${m} طلبك ${inv.invoice_number}.` },
  shipped: { type: "order_shipped", title: "تم شحن طلبك", bodyFor: (m, inv) => `تم شحن طلبك ${inv.invoice_number} من ${m}.` },
  delivered: { type: "order_delivered", title: "تم تسليم طلبك", bodyFor: (m, inv) => `تم تسليم طلبك ${inv.invoice_number}. يرجى تقييم التاجر ${m}.` },
  new_review: { type: "new_review", title: "تقييم جديد", bodyFor: () => `تلقيت تقييماً جديداً على متجرك.` },
  chat_message: { type: "chat_message", title: "رسالة جديدة", bodyFor: () => `لديك رسالة جديدة في المحادثة.` },
};

// إشعار للمشتري عند تغيير حالة الفاتورة (داخلي + واتساب)
export async function notifyBuyerOnStatus(invoice, merchantName, statusKey) {
  const cfg = STATUS_MAP[statusKey];
  if (!cfg) return;
  const body = cfg.bodyFor(merchantName, invoice);
  await notifyInternal(invoice.buyer_id, cfg.type, cfg.title, body);
  notifyWhatsApp(`${cfg.title}\n${body}`);
}

// إشعار للتاجر بطلب جديد
export async function notifyMerchantNewOrder(invoice, buyerName) {
  const cfg = STATUS_MAP.new_order;
  const body = cfg.bodyFor(buyerName, invoice);
  await notifyInternal(invoice.merchant_id, cfg.type, cfg.title, body);
  notifyWhatsApp(`${cfg.title}\n${body}`);
}

export async function notifyChat(recipientId, senderName) {
  await notifyInternal(recipientId, "chat_message", "رسالة جديدة", `${senderName} أرسل لك رسالة.`);
}