import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import { printInvoice } from "@/lib/exportUtils";
import EmptyState from "@/components/merchant/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Download, Loader2 } from "lucide-react";

const delivLabel = { pending: "قيد المراجعة", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم" };
const statusTone = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function BuyerOrders() {
  const { user, merchants } = useBuyerData();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    setLoading(true);
    base44.entities.Invoice.filter({ buyer_id: user.id }, "-created_date", 100)
      .then((r) => setInvoices(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const tabs = useMemo(() => ({
    pending: invoices.filter((i) => i.delivery_status === "pending" && i.status !== "cancelled"),
    delivering: invoices.filter((i) => ["preparing", "shipped"].includes(i.delivery_status)),
    completed: invoices.filter((i) => i.delivery_status === "delivered"),
    cancelled: invoices.filter((i) => i.status === "cancelled"),
  }), [invoices]);

  const buyerName = user?.display_name || user?.full_name || "مشتري";

  const handlePDF = (inv) => {
    const m = merchantById(merchants, inv.merchant_id);
    printInvoice(inv, buyerName, m?.business_name || "تاجر", inv.items || []);
  };

  const renderList = (list) => (
    list.length === 0 ? (
      <EmptyState icon={Package} title="لا توجد طلبات" subtitle="ستظهر طلباتك هنا بعد تأكيد أول طلب" />
    ) : (
      <div className="space-y-3">
        {list.map((inv) => {
          const m = merchantById(merchants, inv.merchant_id);
          const st = inv.status === "cancelled" ? "cancelled" : inv.delivery_status;
          return (
            <div key={inv.id} className="bg-card rounded-2xl border border-border p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[160px]">
                <p className="font-mono text-xs text-muted-foreground">#{inv.id.slice(0, 10)}</p>
                <p className="font-semibold text-navy mt-0.5">{m?.business_name || "تاجر"}</p>
                <p className="text-xs text-muted-foreground">{new Date(inv.created_date).toLocaleDateString("ar-EG")} · {inv.payment_method || "—"}</p>
              </div>
              <div className="text-center">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusTone[st] || "bg-secondary"}`}>{delivLabel[inv.delivery_status] || (inv.status === "cancelled" ? "ملغاة" : inv.delivery_status)}</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-navy">{(inv.total || 0).toLocaleString("ar-EG")} ر.س</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handlePDF(inv)}><Download className="w-4 h-4" /> PDF</Button>
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
        <TabsContent value="completed" className="mt-5">{loading ? <EmptyState loading /> : renderList(tabs.completed)}</TabsContent>
        <TabsContent value="cancelled" className="mt-5">{loading ? <EmptyState loading /> : renderList(tabs.cancelled)}</TabsContent>
      </Tabs>
    </div>
  );
}