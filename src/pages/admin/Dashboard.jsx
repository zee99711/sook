// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { supabase } from '@/api/supabaseClient';
import { invoicesAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { logAction } from '@/lib/audit';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    merchants: 0,
    buyers: 0,
    invoices: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
  });
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          { count: merchantsCount },
          { count: buyersCount },
          invoices,
          { data: pending },
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('account_type', 'merchant'),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('account_type', 'buyer'),
          invoicesAPI.listAll(),
          supabase
            .from('merchant_profiles')
            .select(`
              id, business_name, commercial_license_file, created_at, user_id,
              profiles:user_id(full_name, display_name, email)
            `)
            .eq('license_verified', false)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        const totalRevenue = (invoices || [])
          .filter((i) => i.status === 'delivered')
          .reduce((s, i) => s + Number(i.commission || 0), 0);

        setStats({
          merchants: merchantsCount || 0,
          buyers: buyersCount || 0,
          invoices: invoices?.length || 0,
          totalRevenue,
          pendingVerifications: pending?.length || 0,
        });

        setPendingMerchants(pending || []);
        setRecentInvoices(invoices?.slice(0, 5) || []);
      } catch (err) {
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const approveMerchant = async (merchantProfileId) => {
    try {
      const { error } = await supabase
        .from('merchant_profiles')
        .update({
          license_verified: true,
          license_verified_at: new Date().toISOString(),
          license_verified_by: user.id,
        })
        .eq('id', merchantProfileId);

      if (error) throw error;

      await logAction(user, 'approve_merchant', merchantProfileId, 'تم توثيق السجل التجاري');
      setPendingMerchants((prev) => prev.filter((m) => m.id !== merchantProfileId));
      setStats((s) => ({ ...s, pendingVerifications: Math.max(0, s.pendingVerifications - 1) }));
    } catch (err) {
      console.error(err);
      alert('فشل التوثيق');
    }
  };

  const rejectMerchant = async (merchantProfileId) => {
    if (!confirm('هل تريد رفض هذا السجل التجاري؟')) return;
    try {
      await supabase
        .from('merchant_profiles')
        .update({
          commercial_license_file: null,
          license_verified: false,
        })
        .eq('id', merchantProfileId);

      await logAction(user, 'reject_merchant', merchantProfileId, 'تم رفض السجل التجاري');
      setPendingMerchants((prev) => prev.filter((m) => m.id !== merchantProfileId));
    } catch (err) {
      console.error(err);
      alert('فشل الرفض');
    }
  };

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title="لوحة تحكم الأدمن"
        subtitle="إدارة كاملة للمنصة"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Store} label="التجار" value={stats.merchants} tone="navy" />
            <StatCard icon={Users} label="المشترون" value={stats.buyers} tone="gold" />
            <StatCard icon={FileText} label="الفواتير" value={stats.invoices} tone="navy" />
            <StatCard
              icon={TrendingUp}
              label="إيرادات العمولة"
              value={`${stats.totalRevenue.toFixed(0)} ر.س`}
              tone="gold"
            />
            <StatCard
              icon={Clock}
              label="قيد التوثيق"
              value={stats.pendingVerifications}
              tone="navy"
            />
          </div>

          {/* السجلات المعلقة */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-lg font-bold text-navy mb-4">
              سجلات تجارية بحاجة لتوثيق ({pendingMerchants.length})
            </h2>

            {pendingMerchants.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                لا توجد سجلات بحاجة للتوثيق
              </p>
            ) : (
              <div className="space-y-2">
                {pendingMerchants.map((m) => {
                  const p = m.profiles || {};
                  return (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center font-bold">
                          {(m.business_name || 'م').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {m.business_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.display_name || p.full_name} · {p.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {m.commercial_license_file && (
                          <a
                            href={m.commercial_license_file}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-secondary"
                          >
                            عرض السجل
                          </a>
                        )}
                        <button
                          onClick={() => approveMerchant(m.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => rejectMerchant(m.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-destructive text-white hover:bg-destructive/90"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* آخر الفواتير */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-navy mb-4">آخر الفواتير</h2>
            {recentInvoices.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                لا توجد فواتير بعد
              </p>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {inv.invoice_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-navy">
                        {Number(inv.total).toFixed(2)} ر.س
                      </p>
                      <p className="text-xs text-gold">
                        عمولة: {Number(inv.commission || 0).toFixed(2)}
                      </p>
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