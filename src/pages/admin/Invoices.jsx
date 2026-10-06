import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, FileSpreadsheet, Download } from "lucide-react";
import { exportCSV, printTable } from "@/lib/exportUtils";

const delivLabel = { pending: "قيد المراجعة", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم" };

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.MerchantProfile.list(),
    ])
      .then(([inv, m]) => { setInvoices(inv || []); setMerchants(m || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mName = (id) => merchants.find((m) => m.user_id === id)?.business_name || "تاجر";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => !q || (i.invoice_number || "").toLowerCase().includes(q) || (i.buyer_id || "").toLowerCase().includes(q));
  }, [invoices, query]);

  const exportExcel = () => {
    exportCSV("الفواتير", ["رقم الفاتورة", "التاجر", "المشتري", "الإجمالي", "العمولة", "الصافي", "الحالة"], filtered.map((i) => [i.invoice_number, mName(i.merchant_id), `مشتري #${(i.buyer_id || "").slice(-4)}`, i.total, i.commission, i.net_amount, delivLabel[i.delivery_status] || i.delivery_status]));
  };
  const exportPDF = () => {
    printTable("تقرير الفواتير", ["رقم الفاتورة", "التاجر", "الإجمالي", "العمولة", "الحالة"], filtered.map((i) => [i.invoice_number || i.id.slice(0, 8), mName(i.merchant_id), `${i.total} ر.س`, `${(i.commission || 0).toFixed(2)}`, delivLabel[i.delivery_status] || i.delivery_status]));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2"><FileText className="w-6 h-6 text-gold" /> كل الفواتير</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExcel} className="h-11"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
          <Button variant="outline" onClick={exportPDF} className="h-11"><Download className="w-4 h-4" /> PDF</Button>
        </div>
      </div>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث برقم الفاتورة..." className="pr-9 h-10" />
      </div>

      {loading ? (
        <EmptyState loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="لا توجد فواتير" />
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-right px-4 py-3 font-medium">رقم الفاتورة</th>
                <th className="text-right px-4 py-3 font-medium">التاجر</th>
                <th className="text-right px-4 py-3 font-medium">المشتري</th>
                <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                <th className="text-right px-4 py-3 font-medium">الإجمالي</th>
                <th className="text-right px-4 py-3 font-medium">العمولة</th>
                <th className="text-right px-4 py-3 font-medium">الصافي</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{i.invoice_number || i.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{mName(i.merchant_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">#{(i.buyer_id || "").slice(-4)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(i.created_date).toLocaleDateString("ar-EG")}</td>
                  <td className="px-4 py-3 font-semibold">{(i.total || 0).toLocaleString("ar-EG")} ر.س</td>
                  <td className="px-4 py-3 text-muted-foreground">{(i.commission || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3">{(i.net_amount || 0).toLocaleString("ar-EG")} ر.س</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-md bg-secondary text-xs">{delivLabel[i.delivery_status] || i.delivery_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}