// src/lib/notify.js
import { supabase } from '@/api/supabaseClient';

// ============================================================
// إشعار داخلي (لا يفتح أي نافذة خارجية)
// ============================================================
export async function notifyInternal(userId, type, title, body, link = null) {
  if (!userId) return;
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        link,
        is_read: false,
      });

    if (error) {
      console.warn('Notification insert warning:', error.message);
    }
  } catch (err) {
    console.warn('Internal notification failed:', err);
  }
}

// ============================================================
// دالة مساعدة: توليد رابط واتساب (بدون فتحه)
// الاستخدام: window.open(buildWhatsAppLink(text))
// ============================================================
export function buildWhatsAppLink(text, phone = '') {
  const cleanPhone = phone.replace(/\D/g, '');
  const base = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

// ============================================================
// دالة مساعدة: فتح واتساب يدوياً (تُستدعى عند الضغط على زر)
// ============================================================
export function shareOnWhatsApp(text, phone = '') {
  try {
    const link = buildWhatsAppLink(text, phone);
    window.open(link, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.warn('WhatsApp share failed:', err);
  }
}

// ============================================================
// نصوص جاهزة للإشعارات (بدون تنفيذ)
// ============================================================
const STATUS_MAP = {
  new_order: {
    type: 'new_order',
    title: 'طلب جديد',
    bodyFor: (m, inv) =>
      `لديك طلب جديد ${inv.invoice_number} بقيمة ${inv.total} ر.س.`,
  },
  confirmed: {
    type: 'order_confirmed',
    title: 'تم تأكيد طلبك',
    bodyFor: (m, inv) => `أكّد ${m} طلبك ${inv.invoice_number}.`,
  },
  rejected: {
    type: 'order_rejected',
    title: 'تم رفض طلبك',
    bodyFor: (m, inv) => `رفض ${m} طلبك ${inv.invoice_number}.`,
  },
  shipped: {
    type: 'order_shipped',
    title: 'تم شحن طلبك',
    bodyFor: (m, inv) => `تم شحن طلبك ${inv.invoice_number} من ${m}.`,
  },
  delivered: {
    type: 'order_delivered',
    title: 'تم تسليم طلبك',
    bodyFor: (m, inv) =>
      `تم تسليم طلبك ${inv.invoice_number}. يرجى تقييم التاجر ${m}.`,
  },
  new_review: {
    type: 'new_review',
    title: 'تقييم جديد',
    bodyFor: () => `تلقيت تقييماً جديداً على متجرك.`,
  },
  chat_message: {
    type: 'chat_message',
    title: 'رسالة جديدة',
    bodyFor: () => `لديك رسالة جديدة في المحادثة.`,
  },
};

// ============================================================
// إشعار المشتري عند تغيير الحالة (بدون واتساب تلقائي)
// ============================================================
export async function notifyBuyerOnStatus(invoice, merchantName, statusKey) {
  const cfg = STATUS_MAP[statusKey];
  if (!cfg) return;
  const body = cfg.bodyFor(merchantName, invoice);

  // إشعار داخلي فقط (لا واتساب تلقائي)
  await notifyInternal(
    invoice.buyer_id,
    cfg.type,
    cfg.title,
    body,
    `/buyer/orders`
  );
}

// ============================================================
// إشعار التاجر بطلب جديد (بدون واتساب تلقائي)
// ============================================================
export async function notifyMerchantNewOrder(invoice, buyerName) {
  const cfg = STATUS_MAP.new_order;
  const body = cfg.bodyFor(buyerName, invoice);

  // إشعار داخلي فقط
  await notifyInternal(
    invoice.merchant_id,
    cfg.type,
    cfg.title,
    body,
    `/merchant/invoices`
  );
}

// ============================================================
// إشعار محادثة
// ============================================================
export async function notifyChat(recipientId, senderName) {
  await notifyInternal(
    recipientId,
    'chat_message',
    'رسالة جديدة',
    `${senderName} أرسل لك رسالة.`,
    null
  );
}

// ============================================================
// دوال مساعدة لتوليد نصوص الفاتورة (للمشاركة اليدوية)
// ============================================================
export function buildInvoiceShareText(invoice, merchantName, buyerName, items = []) {
  const lines = [
    `🧾 *فاتورة ${invoice.invoice_number}*`,
    `━━━━━━━━━━━━━━━━━`,
    `👤 التاجر: ${merchantName || '—'}`,
    `🛒 المشتري: ${buyerName || '—'}`,
    `📅 التاريخ: ${new Date(invoice.created_at).toLocaleDateString('ar-EG')}`,
    `━━━━━━━━━━━━━━━━━`,
  ];

  if (items.length > 0) {
    lines.push('*المنتجات:*');
    items.forEach((it, idx) => {
      lines.push(
        `${idx + 1}. ${it.name} × ${it.qty} = ${(it.qty * it.unit_price).toFixed(2)} ر.س`
      );
    });
    lines.push(`━━━━━━━━━━━━━━━━━`);
  }

  lines.push(`💰 الإجمالي: *${Number(invoice.total || 0).toFixed(2)} ر.س*`);
  lines.push(`💳 طريقة الدفع: ${invoice.payment_method || '—'}`);
  lines.push(`📊 الحالة: ${invoice.status || '—'}`);

  return lines.join('\n');
}