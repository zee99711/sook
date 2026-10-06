import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/merchant/EmptyState";
import { useMerchantData } from "@/hooks/useMerchantData";
import { LayoutDashboard, Package, Truck, TrendingUp, Bell, ClipboardList, ChevronLeft } from "lucide-react";

function last30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("ar-EG", { day: "numeric", month: "numeric" }), sales: 0 });
  }
  return days;
}

export default function MerchantDashboard() {
  const { user, products, invoices, notifications, loading } = useMerchantData();

  const stats = useMemo(() => {
    const newOrders = invoices.filter((i) => i.delivery_status === "pending").length;
    const inDelivery = invoices.filter((i) => ["preparing", "shipped"].includes(i.delivery_status)).length;
    const now = new Date();
    const monthSales = invoices
      .filter((i) => (i.payment_status === "paid" || i.delivery_status === "delivered") && new Date(i.created_date).getMonth() === now.getMonth() && new Date(i.created_date).getFullYear() === now.getFullYear())
      .reduce((s, i) => s + (i.total || 0), 0);
    return { products: products.length, newOrders, inDelivery, monthSales };
  }, [products, invoices]);

  const chartData = useMemo(() => {
    const days = last30Days();
    invoices.forEach((inv) => {
      if (inv.payment_status === "paid" || inv.delivery_status === "delivered") {
        const k = new Date(inv.created_date).toISOString().slice(0, 10);
        const row = days.find((d) => d.key === k);
        if (row) row.sales += inv.total || 0;
      }
    });
    return days;
  }, [invoices]);

  const recentOrders = useMemo(() => [...invoices].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5), [invoices]);
  const recentNotifs = notifications.slice(0, 5);

  return (
    <div>
      <PageHeader title={`أهلاً ${user?.display_name || user?.full_name || "تاجر"}`} subtitle="نظرة عامة على نشاطك التجاري" icon={LayoutDashboard} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="عدد المنتجات" value={stats.products} tone="navy" />
        <StatCard icon={ClipboardList} label="طلبات جديدة" value={stats.newOrders} tone="gold" />
        <StatCard icon={Truck} label="قيد التسليم" value={stats.inDelivery} tone="muted" />
        <StatCard icon={TrendingUp} label="مبيعات الشهر" value={`${stats.monthSales.toLocaleString("ar-EG")} ر.س`} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* الرسم البياني */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy">المبيعات — آخر 30 يوماً</h3>
            <TrendingUp className="w-5 h-5 text-gold" />
          </div>
          {loading ? (
            <EmptyState loading />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} />
                <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, border: "1px solid #e2e8f0" }} formatter={(v) => [`${v} ر.س`, "مبيعات"]} />
                <Line type="monotone" dataKey="sales" stroke="#C9A961" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* الإشعارات */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy">آخر الإشعارات</h3>
            <Bell className="w-5 h-5 text-gold" />
          </div>
          {recentNotifs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد إشعارات</p>
          ) : (
            <div className="space-y-3">
              {recentNotifs.map((n) => (
                <div key={n.id} className="flex gap-3 p-3 rounded-xl bg-secondary/60">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* آخر الطلبات */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy">آخر الطلبات</h3>
            <Link to="/merchant/invoices" className="text-sm text-gold font-medium inline-flex items-center hover:underline">
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد طلبات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-right py-2 font-medium">رقم الفاتورة</th>
                    <th className="text-right py-2 font-medium">المجموع</th>
                    <th className="text-right py-2 font-medium">حالة التسليم</th>
                    <th className="text-right py-2 font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                      <td className="py-3 font-semibold">{(o.total || 0).toLocaleString("ar-EG")} ر.س</td>
                      <td className="py-3">{deliveryLabel(o.delivery_status)}</td>
                      <td className="py-3 text-muted-foreground">{new Date(o.created_date).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function deliveryLabel(s) {
  const map = { pending: "بانتظار الموافقة", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم" };
  return <span className="px-2 py-1 rounded-md bg-secondary text-xs">{map[s] || s}</span>;
}