import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/merchant/EmptyState";
import { useMerchantData } from "@/hooks/useMerchantData";
import { Button } from "@/components/ui/button";
import { BarChart3, FileSpreadsheet, FileText, Crown, Package } from "lucide-react";
import { exportCSV, printTable } from "@/lib/exportUtils";

const PERIODS = { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" };

export default function MerchantReports() {
  const { invoices, loading } = useMerchantData();
  const [period, setPeriod] = useState("daily");

  const paidInvoices = useMemo(() => invoices.filter((i) => i.payment_status === "paid" || i.delivery_status === "delivered"), [invoices]);

  const salesData = useMemo(() => {
    const series = [];
    if (period === "daily") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
        series.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("ar-EG", { day: "numeric", month: "numeric" }), total: 0, count: 0 });
      }
    } else if (period === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i * 7);
        series.push({ key: `w${i}`, label: `أسبوع ${8 - i}`, total: 0, count: 0 });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        series.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("ar-EG", { month: "long" }), total: 0, count: 0 });
      }
    }
    paidInvoices.forEach((inv) => {
      const d = new Date(inv.created_date);
      let row;
      if (period === "daily") {
        const k = d.toISOString().slice(0, 10);
        row = series.find((s) => s.key === k);
      } else if (period === "weekly") {
        const weekAgo = Math.floor((Date.now() - d.getTime()) / (7 * 24 * 3600 * 1000));
        row = series.find((s) => s.key === `w${weekAgo}`);
      } else {
        row = series.find((s) => s.key === `${d.getFullYear()}-${d.getMonth()}`);
      }
      if (row) { row.total += inv.total || 0; row.count += 1; }
    });
    return series;
  }, [paidInvoices, period]);

  const topProducts = useMemo(() => {
    const map = {};
    paidInvoices.forEach((inv) => {
      (inv.items || []).forEach((it) => {
        const name = it.name || it.product_id || "منتج";
        if (!map[name]) map[name] = { name, qty: 0, revenue: 0 };
        map[name].qty += Number(it.qty) || 0;
        map[name].revenue += (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [paidInvoices]);

  const topBuyers = useMemo(() => {
    const map = {};
    paidInvoices.forEach((inv) => {
      const k = inv.buyer_id || "—";
      if (!map[k]) map[k] = { id: k, total: 0, orders: 0 };
      map[k].total += inv.total || 0;
      map[k].orders += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [paidInvoices]);

  const totalSales = paidInvoices.reduce((s, i) => s + (i.total || 0), 0);

  const exportSales = (type) => {
    const headers = ["الفترة", "المبيعات", "عدد الطلبات"];
    const rows = salesData.map((s) => [s.label, s.total, s.count]);
    if (type === "excel") exportCSV("تقرير-المبيعات", headers, rows);
    else printTable("تقرير المبيعات", headers, rows);
  };

  return (
    <div>
      <PageHeader title="التقارير" subtitle="تحليلات المبيعات والأداء" icon={BarChart3}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportSales("excel")} className="h-11"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
            <Button variant="outline" onClick={() => exportSales("pdf")} className="h-11"><FileText className="w-4 h-4" /> PDF</Button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
          <p className="text-2xl font-bold text-navy mt-1">{totalSales.toLocaleString("ar-EG")} ر.س</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground">عدد الطلبات المدفوعة</p>
          <p className="text-2xl font-bold text-navy mt-1">{paidInvoices.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <p className="text-sm text-muted-foreground">متوسط قيمة الطلب</p>
          <p className="text-2xl font-bold text-navy mt-1">{paidInvoices.length ? Math.round(totalSales / paidInvoices.length).toLocaleString("ar-EG") : 0} ر.س</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">تقرير المبيعات</h3>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {Object.entries(PERIODS).map(([k, label]) => (
              <button key={k} onClick={() => setPeriod(k)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${period === k ? "bg-gold text-navy" : "text-muted-foreground"}`}>{label}</button>
            ))}
          </div>
        </div>
        {loading ? <EmptyState loading /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={45} />
              <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(v) => [`${v} ر.س`, "مبيعات"]} />
              <Bar dataKey="total" fill="#C9A961" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-gold" /> أكثر المنتجات مبيعاً</h3>
          {topProducts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p> : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-secondary text-navy flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-navy truncate">{p.name}</span>
                  <span className="text-sm text-muted-foreground">{p.qty} وحدة</span>
                  <span className="text-sm font-semibold">{p.revenue.toLocaleString("ar-EG")} ر.س</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-gold" /> أكثر المشترين نشاطاً</h3>
          {topBuyers.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p> : (
            <div className="space-y-3">
              {topBuyers.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-secondary text-navy flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-navy">مشتري #{b.id?.slice(-4) || "—"}</span>
                  <span className="text-sm text-muted-foreground">{b.orders} طلب</span>
                  <span className="text-sm font-semibold">{b.total.toLocaleString("ar-EG")} ر.س</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}