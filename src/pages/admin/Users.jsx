// src/pages/admin/Users.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Users as UsersIcon, Search, Shield } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { logAction } from '@/lib/audit';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        setUsers(data || []);
      } catch (err) {
        toast.error('فشل التحميل');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterType !== 'all' && u.account_type !== filterType) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (u.full_name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.phone || '').toLowerCase().includes(s)
      );
    });
  }, [users, search, filterType]);

  const toggleStatus = async (u) => {
    if (u.id === user.id) {
      toast.error('لا يمكنك تعليق حسابك الخاص');
      return;
    }
    const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
    try {
      await supabase.from('profiles').update({ status: newStatus }).eq('id', u.id);
      await logAction(user, newStatus === 'suspended' ? 'suspend_user' : 'activate_user', u.id);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, status: newStatus } : x))
      );
      toast.success(newStatus === 'suspended' ? 'تم التعليق' : 'تم التفعيل');
    } catch (err) {
      toast.error('فشل التحديث');
    }
  };

  const promoteToAdmin = async (u) => {
    if (!confirm(`هل تريد ترقية ${u.full_name} إلى أدمن؟`)) return;
    try {
      await supabase
        .from('profiles')
        .update({ account_type: 'admin' })
        .eq('id', u.id);
      await logAction(user, 'promote_admin', u.id);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, account_type: 'admin' } : x))
      );
      toast.success('تم الترقية');
    } catch (err) {
      toast.error('فشل الترقية');
    }
  };

  const typeLabel = (t) =>
    ({ admin: 'أدمن', merchant: 'تاجر', buyer: 'مشتري' }[t] || t);

  return (
    <div>
      <PageHeader
        icon={UsersIcon}
        title="إدارة المستخدمين"
        subtitle={`${users.length} مستخدم`}
      />

      <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم، الإيميل، الجوال..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">الكل</option>
          <option value="merchant">التجار</option>
          <option value="buyer">المشترون</option>
          <option value="admin">الأدمن</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">لا يوجد مستخدمون مطابقون</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-right p-4 font-semibold text-navy">الاسم</th>
                  <th className="text-right p-4 font-semibold text-navy">النوع</th>
                  <th className="text-right p-4 font-semibold text-navy">الحالة</th>
                  <th className="text-right p-4 font-semibold text-navy">تاريخ التسجيل</th>
                  <th className="text-right p-4 font-semibold text-navy">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="p-4">
                      <p className="font-medium text-navy">{u.display_name || u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          u.account_type === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : u.account_type === 'merchant'
                            ? 'bg-gold/20 text-navy'
                            : 'bg-navy/10 text-navy'
                        }`}
                      >
                        {typeLabel(u.account_type)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          u.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {u.status === 'suspended' ? 'معلّق' : 'نشط'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {u.account_type !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => promoteToAdmin(u)}
                          >
                            <Shield className="w-3.5 h-3.5 ml-1" />
                            ترقية
                          </Button>
                        )}
                        {u.id !== user.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(u)}
                            className={
                              u.status === 'suspended'
                                ? 'text-green-600 border-green-200'
                                : 'text-destructive border-destructive/30'
                            }
                          >
                            {u.status === 'suspended' ? 'تفعيل' : 'تعليق'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}