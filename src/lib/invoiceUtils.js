// src/lib/invoiceUtils.js
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { supabase } from '@/api/supabaseClient';

// توليد رقم فاتورة فريد: INV-YYYY-XXXX
export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${year}-${suffix}`;
}

function template(invoice, ctx, qrData) {
  const date = new Date(invoice.created_date || Date.now()).toLocaleDateString('ar-EG');
  const rows = (invoice.items || [])
    .map(
      (it) =>
        `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0">${it.name || ''}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center">${it.qty}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center">${(it.unit_price || 0).toFixed(2)}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center">${((it.qty || 0) * (it.unit_price || 0)).toFixed(2)}</td></tr>`
    )
    .join('');

  return `
  <div dir="rtl" style="font-family:'Cairo','Tajawal',Tahoma,sans-serif;color:#1B2A4A;padding:40px;width:794px;background:#fff">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C9A961;padding-bottom:20px;margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:54px;height:54px;border-radius:12px;background:#C9A961;color:#1B2A4A;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:28px">و</div>
        <div>
          <div style="font-size:22px;font-weight:800">سوق الوسيط</div>
          <div style="font-size:12px;color:#64748b">منصة التجارة بين الشركات</div>
        </div>
      </div>
      <div style="text-align:left">
        <div style="font-size:13px;color:#64748b">رقم الفاتورة</div>
        <div style="font-size:20px;font-weight:800">${invoice.invoice_number || invoice.id.slice(0, 8)}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px">التاريخ: ${date}</div>
      </div>
    </div>

    <div style="display:flex;gap:24px;margin-bottom:24px">
      <div style="flex:1;background:#f8fafc;border-radius:10px;padding:14px">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px">بيانات التاجر</div>
        <div style="font-weight:700">${ctx.merchantName}</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:10px;padding:14px">
        <div style="font-size:12px;color:#64748b;margin-bottom:4px">بيانات المشتري</div>
        <div style="font-weight:700">${ctx.buyerName}</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
      <thead><tr style="background:#1B2A4A;color:#fff">
        <th style="padding:10px;text-align:right">المنتج</th>
        <th style="padding:10px;text-align:center">الكمية</th>
        <th style="padding:10px;text-align:center">سعر الوحدة</th>
        <th style="padding:10px;text-align:center">المجموع</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div style="text-align:center">
        <img src="${qrData}" width="110" height="110" style="border:1px solid #e2e8f0;border-radius:8px" />
        <div style="font-size:11px;color:#64748b;margin-top:6px">امسح للتحقق</div>
      </div>
      <div style="width:280px;font-size:14px">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0"><span>المجموع الفرعي</span><span>${(ctx.subtotal || 0).toFixed(2)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0"><span>العمولة (${ctx.methodLabel})</span><span>${(ctx.commission || 0).toFixed(2)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0"><span>الصافي للتاجر</span><span>${(ctx.net || 0).toFixed(2)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:800;font-size:16px;color:#1B2A4A"><span>الإجمالي المستحق</span><span>${(invoice.total || 0).toFixed(2)} ر.س</span></div>
      </div>
    </div>

    <div style="margin-top:30px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:14px">هذه الفاتورة مُولّدة آلياً من منصة سوق الوسيط · تحقق عبر رمز QR</div>
  </div>`;
}

// توليد PDF وحفظه في Supabase Storage
export async function generateAndSaveInvoicePDF(invoice, ctx) {
  const verifyUrl = `${window.location.origin}/verify-invoice?n=${encodeURIComponent(invoice.invoice_number || '')}`;
  const qrData = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  const node = document.createElement('div');
  node.innerHTML = template(invoice, ctx, qrData);
  node.style.position = 'fixed';
  node.style.top = '0';
  node.style.right = '-9999px';
  node.style.background = '#fff';
  document.body.appendChild(node);

  try {
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: '#fff',
      useCORS: true,
    });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;

    pdf.addImage(img, 'PNG', 0, position, pageW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(img, 'PNG', 0, position, pageW, imgH);
      heightLeft -= pageH;
    }

    const blob = pdf.output('blob');
    const fileName = `${invoice.invoice_number || 'invoice'}-${Date.now()}.pdf`;
    const filePath = `invoices/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, blob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return publicUrl;
  } finally {
    document.body.removeChild(node);
  }
}