import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { logAction } from "@/lib/audit";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, ShieldCheck, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AdminUsers() {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.User.list()
      .then((r) => setUsers(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !(u.email || "").toLowerCase().includes(q) && !(u.display_name || u.full_name || "").toLowerCase().includes(q)) return false;
      if (typeFilter && u.account_type !== typeFilter) return false;
      return true;
    });
  }, [users, query, typeFilter]);

  const setStatus = async (u, status) => {
    setBusy(u.id);
    try {
      await base44.entities.User.update(u.id, { status });
      await logAction(admin, status === "suspended" ? "block_user" : "activate_user", u.email || u.id, `الحالة: ${status}`);
      toast({ title: status === "suspended" ? "تم حظر المستخدم" : "تم تفعيل المستخدم" });
      load();
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const typeLabel = { admin: "مدير", merchant: "تاجر", buyer: "مشتري" };
  const statusBadge = (s) => {
    if (s === "suspended") return <Badge className="bg-red-100 text-red-700">محظور</Badge>;
    if (s === "pending_review") return <Badge className="bg-amber-100 text-amber-700">قيد المراجعة</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700">نشط</Badge>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-gold" /> إدارة المستخدمين</h1>

      <div className="bg-card rounded-2xl border border-border p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم أو البريد..." className="pr-9 h-10" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">كل الأنواع</option>
          <option value="merchant">تجار</option>
          <option value="buyer">مشترين</option>
          <option value="admin">مدراء</option>
        </select>
      </div>

      {loading ? (
        <EmptyState loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد مستخدمون" />
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-right px-4 py-3 font-medium">المستخدم</th>
                <th className="text-right px-4 py-3 font-medium">البريد</th>
                <th className="text-right px-4 py-3 font-medium">النوع</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">{(u.display_name || u.full_name || u.email || "م").charAt(0)}</div>
                      <span className="font-medium text-navy">{u.display_name || u.full_name || "بدون اسم"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">{typeLabel[u.account_type] || u.account_type}</td>
                  <td className="px-4 py-3">{statusBadge(u.status)}</td>
                  <td className="px-4 py-3">
                    {u.account_type === "admin" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : u.status === "suspended" ? (
                      <Button size="sm" variant="outline" className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => setStatus(u, "active")} disabled={busy === u.id}>
                        {busy === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} تفعيل
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setStatus(u, "suspended")} disabled={busy === u.id}>
                        {busy === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />} حظر
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}