import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, CreditCard, Star, Save, Loader2, Plus, Trash2, Star as StarIcon } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/buyerConstants";
import { toast } from "@/components/ui/use-toast";

export default function BuyerProfile() {
  const { user, profile, merchants, refresh } = useBuyerData();
  const [form, setForm] = useState({ display_name: "", phone: "", shop_name: "", address: "" });
  const [payments, setPayments] = useState([]);
  const [newPay, setNewPay] = useState({ method: "cod", label: "" });
  const [reviews, setReviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setForm({
        display_name: user?.display_name || user?.full_name || "",
        phone: user?.phone || "",
        shop_name: profile?.shop_name || "",
        address: profile?.address || "",
      });
      setPayments(profile?.saved_payments || []);
      if (user) {
        base44.entities.Review.filter({ reviewer_id: user.id }, "-created_date", 50).then((r) => setReviews(r || [])).catch(() => {});
      }
      setLoading(false);
    };
    if (user) init();
  }, [user, profile]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveInfo = async () => {
    setSaving(true);
    try {
      // بيانات المستخدم (display_name, phone عبر updateMe)
      await base44.auth.updateMe({ display_name: form.display_name, phone: form.phone });
      // بيانات الملف (shop_name, address)
      if (profile) {
        await base44.entities.BuyerProfile.update(profile.id, { shop_name: form.shop_name, address: form.address });
      } else if (user) {
        await base44.entities.BuyerProfile.create({ user_id: user.id, buyer_type: "general", shop_name: form.shop_name, address: form.address, saved_payments: payments });
      }
      toast({ title: "تم حفظ البيانات" });
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addPayment = async () => {
    if (!newPay.label.trim()) { toast({ title: "أدخل وصفاً لطريقة الدفع" }); return; }
    const method = PAYMENT_METHODS.find((m) => m.id === newPay.method);
    const entry = { method: method?.label || newPay.method, label: newPay.label.trim() };
    const next = [...payments, entry];
    setPayments(next);
    setNewPay({ method: "cod", label: "" });
    if (profile) await base44.entities.BuyerProfile.update(profile.id, { saved_payments: next });
  };

  const removePayment = async (idx) => {
    const next = payments.filter((_, i) => i !== idx);
    setPayments(next);
    if (profile) await base44.entities.BuyerProfile.update(profile.id, { saved_payments: next });
  };

  if (loading) return <EmptyState loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><User className="w-6 h-6 text-gold" /> الملف الشخصي</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* البيانات */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><User className="w-5 h-5 text-gold" /> البيانات</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={form.display_name} onChange={set("display_name")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input value={form.phone} onChange={set("phone")} className="h-11" placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label>اسم المحل (اختياري)</Label>
              <Input value={form.shop_name} onChange={set("shop_name")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input value={user?.email || ""} disabled className="h-11 bg-secondary/50" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>العنوان</Label>
              <Textarea rows={2} value={form.address} onChange={set("address")} placeholder="العنوان التفصيلي" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={saveInfo} disabled={saving} className="h-11 bg-gold text-navy hover:bg-gold/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ
            </Button>
          </div>
        </div>

        {/* طرق الدفع المحفوظة */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-gold" /> طرق الدفع المحفوظة</h3>
          <div className="space-y-2 mb-4">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد طرق دفع محفوظة</p>
            ) : (
              payments.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/60">
                  <CreditCard className="w-4 h-4 text-navy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">{p.method}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.label}</p>
                  </div>
                  <button onClick={() => removePayment(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2 pt-3 border-t border-border">
            <Label>إضافة طريقة دفع</Label>
            <div className="flex gap-2">
              <select value={newPay.method} onChange={(e) => setNewPay((p) => ({ ...p, method: e.target.value }))} className="h-10 rounded-md border border-input bg-transparent px-2 text-sm">
                {PAYMENT_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <Input value={newPay.label} onChange={(e) => setNewPay((p) => ({ ...p, label: e.target.value }))} placeholder="وصف (رقم/اسم)" className="h-10" />
              <Button onClick={addPayment} size="icon" className="h-10 w-10 bg-gold text-navy hover:bg-gold/90"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* التقييمات التي كتبها */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-5">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-gold" /> تقييماتي</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لم تكتب أي تقييم بعد</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => {
                const m = merchantById(merchants, r.merchant_id);
                return (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40">
                    <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center text-navy font-bold shrink-0">{(m?.business_name || "ت").charAt(0)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-navy text-sm">{m?.business_name || "تاجر"}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />)}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}