// src/pages/buyer/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Search, ShoppingCart, Package, Store } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { invoicesAPI, productsAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    delivered: 0,
    merchantsCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const [invoices, { data: profiles }] = await Promise.all([
          invoicesAPI.listByBuyer(user.id),
          supabase.from('profiles').select('id').eq('account_type', 'merchant'),
        ]);

        setStats({
          totalOrders: invoices.length,
          pending: invoices.filter((i) => i.status === 'pending').length,
          delivered: invoices.filter((i) => i.status === 'delivered').length,
          merchantsCount: profiles?.length || 0,
        });

        setRecentOrders(invoices.slice(0, 5));

        // آخر المنتجات من Supabase
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);

        setRecentProducts(products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title={`مرحباً، ${user?.display_name || user?.full_name || 'مشتري'}`}
        subtitle="نظرة سريعة على حسابك"
        action={
          <Link
            to="/buyer/browse"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy/90 text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            تصفح المنتجات
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Package} label="إجمالي طلباتي" value={stats.totalOrders} tone="navy" />
            <StatCard icon={ShoppingCart} label="قيد المراجعة" value={stats.pending} tone="gold" />
            <StatCard icon={Package} label="طلبات مكتملة" value={stats.delivered} tone="navy" />
            <StatCard icon={Store} label="تجار متاحون" value={stats.merchantsCount} tone="gold" />
          </div>

          {/* آخر المنتجات */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">آخر المنتجات المُضافة</h2>
              <Link to="/buyer/browse" className="text-sm text-gold hover:underline">
                عرض الكل
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                لا توجد منتجات بعد
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recentProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/buyer/product/${p.id}`}
                    className="rounded-xl border border-border p-3 hover:border-gold transition-colors"
                  >
                    <div className="aspect-square bg-secondary rounded-lg mb-2 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-navy line-clamp-2">{p.name}</p>
                    <p className="text-xs text-gold font-bold mt-1">
                      {Number(p.price).toFixed(2)} ر.س
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* آخر الطلبات */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">آخر طلباتي</h2>
              <Link to="/buyer/orders" className="text-sm text-gold hover:underline">
                عرض الكل
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                لم تقم بأي طلبات بعد
              </p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-navy">
                      {Number(inv.total).toFixed(2)} ر.س
                    </span>
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