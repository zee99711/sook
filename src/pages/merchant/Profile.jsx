import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/merchant/EmptyState";
import { useMerchantData } from "@/hooks/useMerchantData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Store, Save, Loader2, Upload, FileCheck, Copy, RefreshCw, ShieldCheck, Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function MerchantProfile() {
  const { user, profile, loading, refresh } = useMerchantData();
  const [form, setForm] = useState({ business_name: "", region: "", address: "" });
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({ notify_new_orders: true, notify_low_stock: true });
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ business_name: profile.business_name || "", region: profile.region || "", address: profile.address || "" });
      setNotif({ notify_new_orders: profile.notify_new_orders ?? true, notify_low_stock: profile.notify_low_stock ?? true });
      setInviteCode(profile.invite_code || "");
    }
  }, [profile]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.MerchantProfile.update(profile.id, { logo_url: file_url });
      toast({ title: "تم رفع الشعار" });
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل الرفع", variant: "destructive" });
    } finally {
      setLogoUploading(false);
    }
  };

  const saveInfo = async () => {
    setSaving(true);
    try {
      await base44.entities.MerchantProfile.update(profile.id, form);
      toast({ title: "تم حفظ بيانات المحل" });
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotif = async (key, val) => {
    setNotif((n) => ({ ...n, [key]: val }));
    try {
      await base44.entities.MerchantProfile.update(profile.id, { [key]: val });
    } catch {
      toast({ title: "تعذّر تحديث الإعداد", variant: "destructive" });
    }
  };

  const regenerateCode = async () => {
    const code = genCode();
    setSaving(true);
    try {
      await base44.entities.MerchantProfile.update(profile.id, { invite_code: code });
      setInviteCode(code);
      toast({ title: "تم إنشاء كود دعوة جديد" });
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inviteLink = inviteCode ? `${window.location.origin}/register?invite=${inviteCode}` : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  };

  const viewLicense = async () => {
    if (!profile?.commercial_license_file) return;
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: profile.commercial_license_file });
      window.open(signed_url, "_blank");
    } catch (err) {
      toast({ title: err.message || "تعذّر فتح الملف", variant: "destructive" });
    }
  };

  if (loading) return <EmptyState loading />;
  if (!profile) return <EmptyState icon={Store} title="لا يوجد ملف تاجر" subtitle="يرجى إكمال بيانات التسجيل أولاً" />;

  return (
    <div>
      <PageHeader title="الملف الشخصي والإعدادات" subtitle="بيانات المحل والإشعارات وكود الدعوة" icon={Settings} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* الشعار + حالة التحقق */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4">شعار المحل</h3>
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center mb-4">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="شعار" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <label className="cursor-pointer">
              <Button asChild variant="outline" className="h-10" disabled={logoUploading}>
                <span>
                  {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  رفع شعار
                </span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </label>
            <div className="mt-5 w-full flex items-center justify-between p-3 rounded-xl bg-secondary/60">
              <span className="text-sm text-muted-foreground">حالة التحقق</span>
              {profile.license_verified ? (
                <Badge className="bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3" /> موثّق</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700">قيد المراجعة</Badge>
              )}
            </div>
          </div>
        </div>

        {/* بيانات المحل */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4">بيانات المحل</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم المحل</Label>
              <Input value={form.business_name} onChange={set("business_name")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>المنطقة</Label>
              <Input value={form.region} onChange={set("region")} className="h-11" placeholder="المدينة" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>العنوان</Label>
              <Textarea rows={2} value={form.address} onChange={set("address")} placeholder="العنوان التفصيلي" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-secondary/60">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-gold" />
              <span className="text-sm">السجل التجاري</span>
            </div>
            <Button variant="outline" size="sm" onClick={viewLicense} disabled={!profile.commercial_license_file}>عرض / تحميل</Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveInfo} className="bg-gold text-navy hover:bg-gold/90 h-11" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ البيانات
            </Button>
          </div>
        </div>

        {/* إعدادات الإشعارات */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-gold" /> الإشعارات</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">إشعار الطلبات الجديدة</p>
                <p className="text-xs text-muted-foreground">عند استلام طلب جديد</p>
              </div>
              <Switch checked={notif.notify_new_orders} onCheckedChange={(v) => toggleNotif("notify_new_orders", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">تنبيه نفاد المخزون</p>
                <p className="text-xs text-muted-foreground">عند نقص كمية منتج</p>
              </div>
              <Switch checked={notif.notify_low_stock} onCheckedChange={(v) => toggleNotif("notify_low_stock", v)} />
            </div>
          </div>
        </div>

        {/* كود الدعوة */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-1">كود الدعوة الخاص بالزبائن</h3>
          <p className="text-sm text-muted-foreground mb-4">شارك هذا الرابط مع زبائنك الخاصين ليشتركوا ويرتبطوا بمتجرك مباشرة.</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 h-12 rounded-xl bg-secondary font-mono text-lg font-bold text-navy tracking-widest">
              {inviteCode || "—"}
            </div>
            <Button variant="outline" className="h-12" onClick={regenerateCode} disabled={saving}>
              <RefreshCw className="w-4 h-4" /> {inviteCode ? "كود جديد" : "إنشاء كود"}
            </Button>
          </div>
          {inviteLink && (
            <div className="mt-4 flex items-center gap-2">
              <Input readOnly value={inviteLink} className="h-11 font-mono text-xs" />
              <Button variant="outline" className="h-11" onClick={copyLink}>
                <Copy className="w-4 h-4" /> {copied ? "تم النسخ" : "نسخ"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}