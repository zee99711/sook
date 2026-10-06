import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import { printInvoice } from "@/lib/exportUtils";
import EmptyState from "@/components/merchant/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, Download, Star, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const delivLabel = { pending: "قيد المراجعة", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم" };
const statusTone = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function BuyerOrders() {
  const { user, merchants, refresh } = useBuyerData();
  const [invoices, setInvoices] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rateTarget, setRateTarget] = useState(null); // invoice
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      base44.entities.Invoice.filter({ buyer_id: user.id }, "-created_date", 100),
      base44.entities.Review.filter({ reviewer_id: user.id }, "-created_date", 50),
    ])
      .then(([inv, rev]) => { setInvoices(inv || []); setMyReviews(rev || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const ratedIds = useMemo(() => new Set((myReviews || []).map((r) => r.invoice_id).filter(Boolean)), [myReviews]);

  const tabs = useMemo(() => ({
    pending: invoices.filter((i) => i.delivery_status === "pending" && i.status !== "cancelled"),
    delivering: invoices.filter((i) => ["preparing", "shipped"].includes(i.delivery_status)),
    completed: invoices.filter((i) => i.delivery_status === "delivered"),
    cancelled: invoices.filter((i) => i.status === "cancelled"),
  }), [invoices]);

  const buyerName = user?.display_name || user?.full_name || "مشتري";

  const handlePDF = (inv) => {
    if (inv.pdf_url) { window.open(inv.pdf_url, "_blank"); return; }
    const m = merchantById(merchants, inv.merchant_id);
    printInvoice(inv, buyerName, m?.business_name || "تاجر", inv.items || []);
  };

  const openRate = (inv) => { setRateTarget(inv); setRating(5); setComment(""); };
  const submitReview = async () => {
    if (!rateTarget) return;
    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        reviewer_id: user.id,
        merchant_id: rateTarget.merchant_id,
        invoice_id: rateTarget.id,
        rating,
        comment: comment.trim(),
      });
      // إعادة حساب متوسط تقييم التاجر
      const reviews = await base44.entities.Review.filter({ merchant_id: rateTarget.merchant_id });
      const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
      const prof = await base44.entities.MerchantProfile.filter({ user_id: rateTarget.merchant_id });
      if (prof[0]) await base44.entities.MerchantProfile.update(prof[0].id, { rating_avg: Math.round(avg * 10) / 10 });
      toast({ title: "شكراً لتقييمك" });
      setRateTarget(null);
      load();
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل إرسال التقييم", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderList = (list, canRate = false) => (
    list.length === 0 ? (
      <EmptyState icon={Package} title="لا توجد طلبات" subtitle="ستظهر طلباتك هنا بعد تأكيد أول طلب" />
    ) : (
      <div className="space-y-3">
        {list.map((inv) => {
          const m = merchantById(merchants, inv.merchant_id);
          const st = inv.status === "cancelled" ? "cancelled" : inv.delivery_status;
          const canReview = canRate && inv.status !== "cancelled" && !ratedIds.has(inv.id);
          return (
            <div key={inv.id} className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[160px]">
                <p className="font-mono text-xs text-muted-foreground">{inv.invoice_number || `#${inv.id.slice(0, 10)}`}</p>
                <p className="font-semibold text-navy mt-0.5">{m?.business_name || "تاجر"}</p>
                <p className="text-xs text-muted-foreground">{new Date(inv.created_date).toLocaleDateString("ar-EG")} · {inv.payment_method || "—"}</p>
              </div>
              <div className="text-center">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusTone[st] || "bg-secondary"}`}>{delivLabel[inv.delivery_status] || (inv.status === "cancelled" ? "ملغاة" : inv.delivery_status)}</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-navy">{(inv.total || 0).toLocaleString("ar-EG")} ر.س</p>
                <p className="text-[11px] text-muted-foreground">عمولة {(inv.commission || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} · صافي التاجر {(inv.net_amount || 0).toLocaleString("ar-EG")}</p>
              </div>
              <div className="flex gap-2">
                {canReview && <Button onClick={() => openRate(inv)} size="sm" className="h-9 bg-gold text-navy hover:bg-gold/90"><Star className="w-4 h-4" /> قيّم</Button>}
                <Button variant="outline" size="sm" onClick={() => handlePDF(inv)}><Download className="w-4 h-4" /> PDF</Button>
              </div>
            </div>
          );
        })}
      </div>
    )
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><Package className="w-6 h-6 text-gold" /> طلباتي</h1>
      <Tabs defaultValue="pending">
        <TabsList className="bg-card border border-border p-1 flex-wrap">
          <TabsTrigger value="pending">قيد المراجعة ({tabs.pending.length})</TabsTrigger>
          <TabsTrigger value="delivering">قيد التسليم ({tabs.delivering.length})</TabsTrigger>
          <TabsTrigger value="completed">مكتملة ({tabs.completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">ملغاة ({tabs.cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-5">{loading ? <EmptyState loading /> : renderList(tabs.pending)}</TabsContent>
        <TabsContent value="delivering" className="mt-5">{loading ? <EmptyState loading /> : renderList(tabs.delivering)}</TabsContent>
        <TabsContent value="completed" className="mt-5">{loading ? <EmptyState loading /> : renderList(tabs.completed, true)}</TabsContent>
        <TabsContent value="cancelled" className="mt-5">{loading ? <EmptyState loading /> : renderList(tabs.cancelled)}</TabsContent>
      </Tabs>

      <Dialog open={!!rateTarget} onOpenChange={(o) => !o && setRateTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>قيّم التاجر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} type="button">
                  <Star className={`w-9 h-9 ${s <= rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقك (اختياري)..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateTarget(null)}>إلغاء</Button>
            <Button onClick={submitReview} disabled={submitting} className="bg-gold text-navy hover:bg-gold/90">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} إرسال التقييم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}