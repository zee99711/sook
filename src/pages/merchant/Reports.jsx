// src/pages/merchant/Reports.jsx
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { invoicesAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function MerchantReports() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    invoicesAPI
      .listByMerchant(user.id)
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const salesByDay = React.useMemo(() => {
    const map = {};
    invoices.forEach((inv) => {
      const day = new Date(inv.created_at).toISOString().slice(0, 10);
      map[day] = (map[day] || 0) + Number(inv.total || 0);
    });
    return Object.entries(map)
      .sort()
      .slice(-30)
      .map(([date, total]) => ({ date: date.slice(5), total }));
  }, [invoices]);

  const totalRevenue = invoices
    .filter((i) => i.status === 'delivered')
    .reduce((s, i) => s + Number(i.net_merchant || i.total || 0), 0);

  const totalInvoices = invoices.length;
  const deliveredCount = invoices.filter((i) => i.status === 'delivered').length;
  const uniqueBuyers = new Set(invoices.map((i) => i.buyer_id)).size;

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>;
  }

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="التقارير"
        subtitle="نظرة تحليلية على أداء متجرك"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="إجمالي الإيرادات"
          value={`${totalRevenue.toFixed(0)} ر.س`}
          tone="navy"
        />
        <StatCard
          icon={BarChart3}
          label="إجمالي الفواتير"
          value={totalInvoices}
          tone="gold"
        />
        <StatCard
          icon={Package}
          label="طلبات مكتملة"
          value={deliveredCount}
          tone="navy"
        />
        <StatCard
          icon={Users}
          label="مشترون فريدون"
          value={uniqueBuyers}
          tone="gold"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-navy mb-4">
          المبيعات — آخر 30 يوم
        </h2>
        {salesByDay.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">
            لا توجد بيانات لعرضها بعد
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B2A4A',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  direction: 'rtl',
                }}
                formatter={(v) => [`${Number(v).toFixed(2)} ر.س`, 'المبيعات']}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#C9A961"
                strokeWidth={3}
                dot={{ fill: '#1B2A4A', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}