// src/pages/admin/Merchants.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Store, Search, CheckCircle2, XCircle, Shield } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/lib/AuthContext';
import { logAction } from '@/lib/audit';
import toast from 'react-hot-toast';

export default function AdminMerchants() {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const load = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, email, phone, status, region, created_at')
        .eq('account_type', 'merchant')
        .order('created_at', { ascending: false });

      const { data: mps } = await supabase
        .from('merchant_profiles')
        .select('*');

      const enriched = (profiles || []).map((p) => {
        const mp = (mps || []).find((m) => m.user_id === p.id) || {};
        return { ...p, ...mp };
      });

      setMerchants(enriched);
    } catch (err) {
      console.error(err);
      toast.error('فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      if (search) {
        const s = search.toLowerCase();
        const match =
          (m.business_name || '').toLowerCase().includes(s) ||
          (m.full_name || '').toLowerCase().includes(s) ||
          (m.email || '').toLowerCase().includes(s);
        if (!match) return false;
      }
      if (tab === 'verified') return m.license_verified;
      if (tab === 'pending') return !m.license_verified && m.commercial_license_file;
      if (tab === 'unverified') return !m.commercial_license_file;
      return true;
    });
  }, [merchants, search, tab]);

  const toggleStatus = async (m) => {
    const newStatus = m.status === 'suspended' ? 'active' : 'suspended';
    try {
      await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', m.id);

      await logAction(user, newStatus === 'suspended' ? 'suspend_user' : 'activate_user', m.id);
      setMerchants((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: newStatus } : x))
      );
      toast.success(newStatus === 'suspended' ? 'تم التعليق' : 'تم التفعيل');
    } catch (err) {
      toast.error('فشل التحديث');
    }
  };

  const verifyManually = async (m) => {
    try {
      await supabase
        .from('merchant_profiles')
        .update({
          license_verified: true,
          license_verified_at: new Date().toISOString(),
          license_verified_by: user.id,
        })
        .eq('user_id', m.id);
      await logAction(user, 'verify_merchant', m.id);
      toast.success('تم التوثيق');
      load();
    } catch (err) {
      toast.error('فشل التوثيق');
    }
  };

  return (
    <div>
      <PageHeader
        icon={Store}
        title="إدارة التجار"
        subtitle={`${merchants.length} تاجر مسجل`}
      />

      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">الكل ({merchants.length})</TabsTrigger>
          <TabsTrigger value="verified">
            موثّقون ({merchants.filter((m) => m.license_verified).length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            قيد التوثيق ({merchants.filter((m) => !m.license_verified && m.commercial_license_file).length})
          </TabsTrigger>
          <TabsTrigger value="unverified">
            بدون سجل ({merchants.filter((m) => !m.commercial_license_file).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا يوجد تجار مطابقون</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-right p-4 font-semibold text-navy">التاجر</th>
                      <th className="text-right p-4 font-semibold text-navy">الحالة</th>
                      <th className="text-right p-4 font-semibold text-navy">التوثيق</th>
                      <th className="text-right p-4 font-semibold text-navy">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id} className="border-t border-border">
                        <td className="p-4">
                          <p className="font-medium text-navy">
                            {m.business_name || m.display_name || m.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              m.status === 'suspended'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {m.status === 'suspended' ? 'معلّق' : 'نشط'}
                          </span>
                        </td>
                        <td className="p-4">
                          {m.license_verified ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                              <Shield className="w-3 h-3" />
                              موثّق
                            </span>
                          ) : m.commercial_license_file ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                              قيد المراجعة
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                              بدون سجل
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {!m.license_verified && m.commercial_license_file && (
                              <Button
                                size="sm"
                                onClick={() => verifyManually(m)}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                                توثيق
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleStatus(m)}
                              className={
                                m.status === 'suspended'
                                  ? 'text-green-600 border-green-200'
                                  : 'text-destructive border-destructive/30'
                              }
                            >
                              {m.status === 'suspended' ? 'تفعيل' : 'تعليق'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}