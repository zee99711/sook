import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { logAction } from "@/lib/audit";
import { getCommissions, clearCommissionCache } from "@/lib/commissions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Percent, FolderPlus, History, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-gold" /> إعدادات المنصة</h1>
      <Tabs defaultValue="commissions">
        <TabsList className="bg-card border border-border p-1 flex-wrap">
          <TabsTrigger value="commissions"><Percent className="w-4 h-4" /> العمولات</TabsTrigger>
          <TabsTrigger value="categories"><FolderPlus className="w-4 h-4" /> الفئات</TabsTrigger>
          <TabsTrigger value="audit"><History className="w-4 h-4" /> سجل العمليات</TabsTrigger>
        </TabsList>
        <TabsContent value="commissions" className="mt-5"><CommissionsTab /></TabsContent>
        <TabsContent value="categories" className="mt-5"><CategoriesTab /></TabsContent>
        <TabsContent value="audit" className="mt-5"><AuditTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function CommissionsTab() {
  const { user: admin } = useAuth();
  const [rates, setRates] = useState({ cod: 3, usdt: 2, shamcash: 2.5, syrcash: 2.5, tax: 0 });
  const [settingId, setSettingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCommissions().then((c) => {
      setRates({ cod: (c.cod || 0) * 100, usdt: (c.usdt || 0) * 100, shamcash: (c.shamcash || 0) * 100, syrcash: (c.syrcash || 0) * 100, tax: (c.tax || 0) * 100 });
      setSettingId(c.settingId || null);
      setLoading(false);
    });
  }, []);

  const set = (k) => (e) => setRates((r) => ({ ...r, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        cod_rate: Number(rates.cod) / 100,
        usdt_rate: Number(rates.usdt) / 100,
        shamcash_rate: Number(rates.shamcash) / 100,
        syrcash_rate: Number(rates.syrcash) / 100,
        tax_rate: Number(rates.tax) / 100,
      };
      if (settingId) {
        await base44.entities.AppSetting.update(settingId, payload);
      } else {
        const created = await base44.entities.AppSetting.create(payload);
        setSettingId(created.id);
      }
      clearCommissionCache();
      await logAction(admin, "update_commissions", "AppSetting", JSON.stringify(rates));
      toast({ title: "تم حفظ نسب العمولات" });
    } catch (err) {
      toast({ title: err.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">جارٍ التحميل...</div>;

  const fields = [
    { k: "cod", label: "دفع عند التسليم" },
    { k: "usdt", label: "محفظة USDT" },
    { k: "shamcash", label: "شام كاش" },
    { k: "syrcash", label: "سيريتل كاش" },
    { k: "tax", label: "ضريبة عامة" },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 max-w-xl">
      <p className="text-sm text-muted-foreground mb-5">تُحتسب العمولة تلقائياً من قيمة الطلب وتُخصم من مستحقات التاجر. أدخل القيم كنسبة مئوية.</p>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.k} className="flex items-center justify-between gap-4">
            <Label className="flex-1">{f.label}</Label>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" step="0.1" value={rates[f.k]} onChange={set(f.k)} className="h-11 w-28 text-center" />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="mt-6 h-11 bg-gold text-navy hover:bg-gold/90">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
      </Button>
    </div>
  );
}

function CategoriesTab() {
  const { user: admin } = useAuth();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.Category.list().then((r) => { setCats(r || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!name.trim()) { toast({ title: "أدخل اسم الفئة" }); return; }
    setAdding(true);
    try {
      await base44.entities.Category.create({ name: name.trim(), icon: icon.trim() });
      await logAction(admin, "create_category", name.trim());
      setName(""); setIcon("");
      toast({ title: "تمت إضافة الفئة" });
      load();
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const remove = async (c) => {
    try {
      await base44.entities.Category.delete(c.id);
      await logAction(admin, "delete_category", c.name);
      toast({ title: "تم حذف الفئة" });
      load();
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-bold text-navy mb-4">إضافة فئة</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>اسم الفئة</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" placeholder="مثال: مواد غذائية" />
          </div>
          <div className="space-y-2">
            <Label>أيقونة (إيموجي)</Label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="h-11" placeholder="🍎" />
          </div>
          <Button onClick={add} disabled={adding} className="h-11 bg-gold text-navy hover:bg-gold/90">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} إضافة
          </Button>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-bold text-navy mb-4">الفئات الحالية ({cats.length})</h3>
        {loading ? <p className="text-sm text-muted-foreground text-center py-4">جارٍ التحميل...</p> : cats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد فئات</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <div key={c.id} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-secondary">
                {c.icon && <span>{c.icon}</span>}
                <span className="text-sm font-medium text-navy">{c.name}</span>
                <button onClick={() => remove(c)} className="p-1 rounded-full hover:bg-red-100 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AuditLog.list("-created_date", 100).then((r) => { setLogs(r || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const actionLabel = {
    block_user: "حظر مستخدم", activate_user: "تفعيل مستخدم",
    approve_merchant: "موافقة على تاجر", reject_merchant: "رفض تاجر",
    update_commissions: "تعديل العمولات", create_category: "إضافة فئة", delete_category: "حذف فئة",
    confirmed: "تأكيد طلب", rejected: "رفض طلب", shipped: "شحن طلب", delivered: "تسليم طلب",
    update_invoice: "تحديث فاتورة",
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-x-auto">
      {loading ? <p className="text-sm text-muted-foreground text-center py-6">جارٍ التحميل...</p> : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">لا توجد عمليات مسجّلة</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="text-right px-4 py-3 font-medium">العملية</th>
              <th className="text-right px-4 py-3 font-medium">القائم بها</th>
              <th className="text-right px-4 py-3 font-medium">الهدف</th>
              <th className="text-right px-4 py-3 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3"><Badge className="bg-secondary text-navy">{actionLabel[l.action] || l.action}</Badge></td>
                <td className="px-4 py-3 text-navy">{l.actor_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{l.target || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_date).toLocaleString("ar-EG")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}