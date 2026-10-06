import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/merchant/EmptyState";
import { Store, Users, FileText, TrendingUp, Clock, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ merchants: 0, buyers: 0, invoices: 0, revenue: 0, pending: 0, suspended: 0 });
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [merchants, users, invoices] = await Promise.all([
          base44.entities.MerchantProfile.list("-created_date", 200),
          base44.entities.User.list(),
          base44.entities.Invoice.list("-created_date", 200),
        ]);
        const buyers = (users || []).filter((u) => u.account_type === "buyer");
        const pending = (merchants || []).filter((m) => !m.license_verified);
        const revenue = (invoices || []).reduce((s, i) => s + (i.commission || 0), 0);
        setStats({
          merchants: (merchants || []).length,
          buyers: buyers.length,
          invoices: (invoices || []).length,
          revenue,
          pending: pending.length,
          suspended: (users || []).filter((u) => u.status === "suspended").length,
        });
        setPendingMerchants(pending.slice(0, 5));
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <EmptyState loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">لوحة تحكم الإدارة</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Store} label="التجار" value={stats.merchants} tone="navy" />
        <StatCard icon={Users} label="المشترين" value={stats.buyers} tone="gold" />
        <StatCard icon={FileText} label="الفواتير" value={stats.invoices} tone="muted" />
        <StatCard icon={TrendingUp} label="إيرادات المنصة" value={`${stats.revenue.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ر.س`} tone="navy" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-gold" /> تجار قيد المراجعة ({stats.pending})</h3>
          {pendingMerchants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا يوجد تجار بانتظار المراجعة</p>
          ) : (
            <div className="space-y-3">
              {pendingMerchants.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                  <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center text-navy font-bold">{(m.business_name || "ت").charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy text-sm truncate">{m.business_name}</p>
                    <p className="text-xs text-muted-foreground">{m.region || "—"}</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs">قيد المراجعة</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-gold" /> حالة المنصة</h3>
          <div className="space-y-3">
            <Row label="مستخدمون معلّقون" value={stats.suspended} />
            <Row label="تجار موثّقون" value={stats.merchants - stats.pending} />
            <Row label="تجار قيد المراجعة" value={stats.pending} />
            <Row label="إجمالي العمولات المحصّلة" value={`${stats.revenue.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ر.س`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-bold text-navy">{value}</span>
    </div>
  );
}