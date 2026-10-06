// أدوات تصدير البيانات: CSV (يفتح في Excel) وطباعة/PDF عبر نافذة المتصفح (تدعم العربية RTL)

export function exportCSV(filename, headers, rows) {
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openPrintWindow(title, bodyHTML) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
  <style>
    * { font-family: 'Cairo','Tajawal',Tahoma,sans-serif; }
    body { padding: 32px; color: #1B2A4A; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; }
    th { background: #1B2A4A; color: #fff; font-weight: 700; }
    tr:nth-child(even) td { background: #f8fafc; }
    .brand { display:flex; align-items:center; gap:10px; margin-bottom: 20px; }
    .logo { width:40px; height:40px; border-radius:10px; background:#C9A961; color:#1B2A4A; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px; }
    .foot { margin-top: 28px; font-size: 11px; color:#94a3b8; text-align:center; }
  </style></head><body>
  <div class="brand"><div class="logo">و</div><div><h1>${title}</h1><div class="sub">سوق الوسيط — ${new Date().toLocaleDateString("ar-EG")}</div></div></div>
  ${bodyHTML}
  <div class="foot">تم إنشاء هذا المستند من منصة سوق الوسيط</div>
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

export function printTable(title, headers, rows) {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${c == null ? "" : c}</td>`).join("")}</tr>`).join("");
  openPrintWindow(title, `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
}

export function printInvoice(invoice, buyerName, merchantName, items) {
  const rows = (items || []).map(
    (it) =>
      `<tr><td>${it.name || ""}</td><td>${it.qty}</td><td>${it.unit_price}</td><td>${(it.qty * it.unit_price).toFixed(2)}</td></tr>`
  );
  const body = `
    <table style="margin-bottom:20px">
      <tr><td style="border:none;color:#64748b;width:140px">رقم الفاتورة</td><td style="border:none;font-weight:700">${invoice.id}</td></tr>
      <tr><td style="border:none;color:#64748b">التاجر</td><td style="border:none">${merchantName}</td></tr>
      <tr><td style="border:none;color:#64748b">المشتري</td><td style="border:none">${buyerName}</td></tr>
      <tr><td style="border:none;color:#64748b">التاريخ</td><td style="border:none">${new Date(invoice.created_date).toLocaleDateString("ar-EG")}</td></tr>
      <tr><td style="border:none;color:#64748b">طريقة الدفع</td><td style="border:none">${invoice.payment_method || "—"}</td></tr>
    </table>
    <table><thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${rows.join("")}</tbody></table>
    <div style="margin-top:20px;text-align:left;font-size:16px;font-weight:700">الإجمالي: ${invoice.total} ر.س</div>
  `;
  openPrintWindow(`فاتورة ${invoice.id}`, body);
}