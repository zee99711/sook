import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import { useCart } from "@/context/CartContext";
import { PAYMENT_METHODS } from "@/lib/buyerConstants";
import { getCommissions, orderTotals } from "@/lib/commissions";
import { generateInvoiceNumber, generateAndSaveInvoicePDF } from "@/lib/invoiceUtils";
import { notifyMerchantNewOrder } from "@/lib/notify";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Trash2, Minus, Plus, Check, Loader2, MessageCircle, Package } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function BuyerCart() {
  const { user, merchants, loading } = useBuyerData();
  const { items, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [commissions, setCommissions] = useState({ cod: 0.03, usdt: 0.02, shamcash: 0.025, syrcash: 0.025, tax: 0 });

  useEffect(() => { getCommissions().then(setCommissions); }, []);

  const groups = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      if (!map[it.merchant_id]) map[it.merchant_id] = [];
      map[it.merchant_id].push(it);
    });
    return Object.entries(map);
  }, [items]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totals = orderTotals(subtotal, method, commissions);

  const placeOrder = async () => {
    if (!groups.length) return;
    setPlacing(true);
    try {
      const buyerName = user?.display_name || user?.full_name || "مشتري";
      const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label || "";
      const firstPdfUrl = "";

      for (const [merchantId, groupItems] of groups) {
        const sub = groupItems.reduce((s, i) => s + i.price * i.qty, 0);
        const t = orderTotals(sub, method, commissions);
        const invItems = groupItems.map((i) => ({ name: i.name, qty: i.qty, unit_price: i.price, subtotal: i.price * i.qty }));
        const invoice = await base44.entities.Invoice.create({
          buyer_id: user.id,
          merchant_id: merchantId,
          invoice_number: generateInvoiceNumber(),
          items: invItems,
          subtotal: sub,
          total: t.total,
          commission: t.commission,
          net_amount: t.net,
          status: "issued",
          payment_method: methodLabel,
          payment_status: "unpaid",
          delivery_status: "pending",
        });

        // توليد PDF رسمي + QR ورفعه للتخزين وربطه بالفاتورة
        const merchantName = merchantById(merchants, merchantId)?.business_name || "تاجر";
        try {
          const pdf_url = await generateAndSaveInvoicePDF(invoice, {
            merchantName, buyerName, subtotal: sub, commission: t.commission, net: t.net, methodLabel,
          });
          await base44.entities.Invoice.update(invoice.id, { pdf_url });
          invoice.pdf_url = pdf_url;
          if (!firstPdfUrl) window.open(pdf_url, "_blank");
        } catch {
          // تجاهل فشل التوليد — الفاتورة تبقى مسجلة
        }

        // إشعار داخلي + واتساب للتاجر
        await notifyMerchantNewOrder({ ...invoice, total: t.total }, buyerName);
      }

      clear();
      toast({ title: "تم تأكيد طلبك بنجاح", description: "تم توليد الفاتورة وإرسال إشعار للتاجر عبر المنصة وواتساب." });
      navigate("/buyer/orders");
    } catch (err) {
      toast({ title: err.message || "فشل تأكيد الطلب", variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <EmptyState loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-gold" /> سلة المشتري</h1>

      {items.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="سلتك فارغة" subtitle="تصفّح المنتجات وأضف ما تريد" action={<Button asChild className="bg-gold text-navy hover:bg-gold/90"><Link to="/buyer/browse">ابدأ التسوّق</Link></Button>} />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            {groups.map(([merchantId, groupItems]) => {
              const m = merchantById(merchants, merchantId);
              const sub = groupItems.reduce((s, i) => s + i.price * i.qty, 0);
              return (
                <div key={merchantId} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-navy font-bold text-sm">{(m?.business_name || "ت").charAt(0)}</div>
                      <span className="font-semibold text-navy">{m?.business_name || "تاجر"}</span>
                    </div>
                    {m && <Button asChild variant="ghost" size="sm"><Link to={`/buyer/chat?merchant=${m.user_id}`}><MessageCircle className="w-4 h-4" /> مراسلة</Link></Button>}
                  </div>
                  <div className="divide-y divide-border">
                    {groupItems.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 p-4">
                        <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
                          {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-navy truncate">{it.name}</p>
                          <p className="text-sm text-muted-foreground">{(it.price || 0).toLocaleString("ar-EG")} ر.س / {it.unit}</p>
                        </div>
                        <div className="flex items-center border border-border rounded-lg">
                          <button onClick={() => setQty(it.id, it.qty - 1)} className="p-1.5 hover:bg-secondary"><Minus className="w-3.5 h-3.5" /></button>
                          <input value={it.qty} onChange={(e) => setQty(it.id, Math.max(1, Number(e.target.value) || 1))} className="w-12 text-center text-sm border-0 focus:outline-none bg-transparent" />
                          <button onClick={() => setQty(it.id, it.qty + 1)} className="p-1.5 hover:bg-secondary"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <span className="font-bold text-navy w-24 text-left">{(it.price * it.qty).toLocaleString("ar-EG")} ر.س</span>
                        <button onClick={() => remove(it.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 bg-secondary/30 flex justify-between text-sm">
                    <span className="text-muted-foreground">مجموع التاجر</span>
                    <span className="font-bold text-navy">{sub.toLocaleString("ar-EG")} ر.س</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 lg:sticky lg:top-24">
              <h3 className="font-bold text-navy mb-4">ملخص الطلب</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي</span><span className="text-foreground font-medium">{totals.subtotal.toLocaleString("ar-EG")} ر.س</span></div>
                <div className="flex justify-between text-muted-foreground"><span>العمولة</span><span className="text-foreground font-medium">{totals.commission.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ر.س</span></div>
                <div className="flex justify-between text-muted-foreground"><span>الضريبة</span><span className="text-foreground font-medium">{totals.tax.toLocaleString("ar-EG")} ر.س</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-navy text-base"><span>الإجمالي</span><span>{totals.total.toLocaleString("ar-EG")} ر.س</span></div>
              </div>

              <p className="text-sm font-medium text-navy mb-2">طريقة الدفع</p>
              <div className="space-y-2 mb-4">
                {PAYMENT_METHODS.map((m) => {
                  const rate = { cod: commissions.cod, usdt: commissions.usdt, shamcash: commissions.shamcash, syrcash: commissions.syrcash }[m.id];
                  return (
                    <label key={m.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${method === m.id ? "border-gold bg-gold/5" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#C9A961]" />
                        <span className="text-sm font-medium text-navy">{m.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">عمولة {((rate || 0) * 100).toFixed(1)}%</span>
                    </label>
                  );
                })}
              </div>

              <div className="mb-4">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات للتاجر (اختياري)..." rows={2} />
              </div>

              <Button onClick={placeOrder} disabled={placing} className="w-full h-12 bg-gold text-navy hover:bg-gold/90 font-semibold">
                {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ التأكيد وتوليد الفاتورة...</> : <><Check className="w-4 h-4" /> تأكيد الطلب</>}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">سيتم توليد فاتورة PDF وإرسال إشعار داخلي ورسالة واتساب للتاجر.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}