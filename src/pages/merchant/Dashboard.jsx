// src/pages/merchant/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  TrendingUp,
  Warehouse as WarehouseIcon,
  Plus,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { productsAPI, invoicesAPI, notificationsAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    newOrders: 0,
    inTransit: 0,
    delivered: 0,
    monthlyRevenue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const [products, invoices] = await Promise.all([
          productsAPI.listByMerchant(user.id, { limit: 1000 }),
          invoicesAPI.listByMerchant(user.id),
        ]);

        const lowStock = products.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity < 10
        ).length;
        const newOrders = invoices.filter((i) => i.status === 'pending').length;
        const inTransit = invoices.filter((i) => i.status === 'shipped').length;
        const delivered = invoices.filter((i) => i.status === 'delivered');

        // الإيرادات آخر 30 يوم
        const thirtyDaysAgo = Date.now() - 30 * 86400000;
        const monthlyRevenue = delivered
          .filter((i) => new Date(i.created_at).getTime() > thirtyDaysAgo)
          .reduce((sum, i) => sum + Number(i.net_merchant || i.total || 0), 0);

        setStats({
          products: products.length,
          lowStock,
          newOrders,
          inTransit,
          delivered: delivered.length,
          monthlyRevenue,
        });

        setRecentInvoices(invoices.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const statusLabel = (s) =>
    ({
      pending: 'قيد المراجعة',
      confirmed: 'مؤكد',
      shipped: 'قيد التسليم',
      delivered: 'مكتمل',
      rejected: 'مرفوض',
      cancelled: 'ملغى',
    }[s] || s);

  const statusColor = (s) =>
    ({
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }[s] || 'bg-gray-100 text-gray-800');

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title={`مرحباً، ${user?.display_name || user?.full_name || 'تاجر'}`}
        subtitle="نظرة عامة على نشاطك التجاري"
        action={
          <Link
            to="/merchant/warehouse"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Package}
              label="إجمالي المنتجات"
              value={stats.products}
              tone="navy"
            />
            <StatCard
              icon={WarehouseIcon}
              label="مخزون منخفض"
              value={stats.lowStock}
              tone="gold"
            />
            <StatCard
              icon={FileText}
              label="طلبات جديدة"
              value={stats.newOrders}
              tone="navy"
            />
            <StatCard
              icon={TrendingUp}
              label="إيرادات 30 يوم"
              value={`${stats.monthlyRevenue.toFixed(0)} ر.س`}
              tone="gold"
            />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">آخر الطلبات</h2>
              <Link
                to="/merchant/invoices"
                className="text-sm text-gold hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                لا توجد طلبات حتى الآن
              </p>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-navy" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {inv.invoice_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(inv.created_at).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(inv.status)}`}
                      >
                        {statusLabel(inv.status)}
                      </span>
                      <span className="text-sm font-bold text-navy">
                        {Number(inv.total).toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}