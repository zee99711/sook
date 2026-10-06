import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMerchantData } from "@/hooks/useMerchantData";
import { notifyBuyerOnStatus } from "@/lib/notify";
import { printInvoice } from "@/lib/exportUtils";
import { useAuth } from "@/lib/AuthContext";
import { logAction } from "@/lib/audit";
import EmptyState from "@/components/merchant/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Check, X, Download, Printer, Loader2, Truck, PackageCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const payLabel = { unpaid: "غير مدفوع", partial: "مدفوع جزئياً", paid: "مدفوع" };
const payTone = { unpaid: "bg-red-100 text-red-700", partial: "bg-amber-100 text-amber-700", paid: "bg-emerald-100 text-emerald-700" };

export default function MerchantInvoices() {
  const { user, invoices, loading, refresh } = useMerchantData();
  const { user: authUser } = useAuth();
  const [busy, setBusy] = useState(null);

  const tabs = useMemo(
    () => ({
      new: invoices.filter((i) => i.delivery_status === "pending" && i.status !== "cancelled"),
      delivering: invoices.filter((i) => ["preparing", "shipped"].includes(i.delivery_status)),
      completed: invoices.filter((i) => i.delivery_status === "delivered"),
    }),
    [invoices]
  );

  const act = async (invoice, patch, statusKey, msg) => {
    setBusy(invoice.id);
    try {
      const updated = await base44.entities.Invoice.update(invoice.id, patch);
      const merchantName = user?.display_name || user?.full_name || "تاجر";
      if (statusKey) await notifyBuyerOnStatus({ ...invoice, ...patch }, merchantName, statusKey);
      await logAction(authUser, statusKey || "update_invoice", invoice.invoice_number || invoice.id, JSON.stringify(patch));
      toast({ title: msg });
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const buyerRef = (id) => (id ? `مشتري #${id.slice(-4)}` : "—");

  const handlePDF = (inv) => {
    if (inv.pdf_url) { window.open(inv.pdf_url, "_blank"); return; }
    printInvoice(inv, buyerRef(inv.buyer_id), user?.display_name || "تاجر", inv.items || []);
  };

  const renderTable = (list, kind) => (
    list.length === 0 ? (
      <EmptyState icon={FileText} title="لا توجد فواتير" subtitle="ستظهر هنا عند استلام طلبات جديدة" />
    ) : (
      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="text-right px-4 py-3 font-medium">رقم الفاتورة</th>
              <th className="text-right px-4 py-3 font-medium">المشتري</th>
              <th className="text-right px-4 py-3 font-medium">التاريخ</th>
              <th className="text-right px-4 py-3 font-medium">الإجمالي</th>
              <th className="text-right px-4 py-3 font-medium">العمولة</th>
              <th className="text-right px-4 py-3 font-medium">الصافي</th>
              <th className="text-right px-4 py-3 font-medium">الحالة</th>
              <th className="text-right px-4 py-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((inv) => (
              <tr key={inv.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{inv.invoice_number || inv.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{buyerRef(inv.buyer_id)}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(inv.created_date).toLocaleDateString("ar-EG")}</td>
                <td className="px-4 py-3 font-semibold">{(inv.total || 0).toLocaleString("ar-EG")} ر.س</td>
                <td className="px-4 py-3 text-muted-foreground">{(inv.commission || 0).toLocaleString("ar-EG", { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 font-medium">{(inv.net_amount || 0).toLocaleString("ar-EG")} ر.س</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md text-xs font-medium ${payTone[inv.payment_status] || "bg-secondary"}`}>{payLabel[inv.payment_status] || inv.payment_status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {kind === "new" && (
                      <>
                        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => act(inv, { delivery_status: "preparing" }, "confirmed", "تم تأكيد الطلب وإشعار المشتري")} disabled={busy === inv.id}>
                          {busy === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} تأكيد
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => act(inv, { status: "cancelled" }, "rejected", "تم رفض الطلب")} disabled={busy === inv.id}>
                          <X className="w-3 h-3" /> رفض
                        </Button>
                      </>
                    )}
                    {kind === "delivering" && inv.delivery_status === "preparing" && (
                      <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => act(inv, { delivery_status: "shipped" }, "shipped", "تم شحن الطلب")} disabled={busy === inv.id}>
                        <Truck className="w-3 h-3" /> شحن
                      </Button>
                    )}
                    {kind === "delivering" && inv.delivery_status === "shipped" && (
                      <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => act(inv, { delivery_status: "delivered" }, "delivered", "تم تسليم الطلب")} disabled={busy === inv.id}>
                        <PackageCheck className="w-3 h-3" /> تسليم
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => handlePDF(inv)}><Download className="w-3 h-3" /> PDF</Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => handlePDF(inv)}><Printer className="w-3 h-3" /> طباعة</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><FileText className="w-6 h-6 text-gold" /> الفواتير</h1>
      <Tabs defaultValue="new">
        <TabsList className="bg-card border border-border p-1 flex-wrap">
          <TabsTrigger value="new">طلبات جديدة ({tabs.new.length})</TabsTrigger>
          <TabsTrigger value="delivering">قيد التسليم ({tabs.delivering.length})</TabsTrigger>
          <TabsTrigger value="completed">مكتملة ({tabs.completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-5">{loading ? <EmptyState loading /> : renderTable(tabs.new, "new")}</TabsContent>
        <TabsContent value="delivering" className="mt-5">{loading ? <EmptyState loading /> : renderTable(tabs.delivering, "delivering")}</TabsContent>
        <TabsContent value="completed" className="mt-5">{loading ? <EmptyState loading /> : renderTable(tabs.completed, "completed")}</TabsContent>
      </Tabs>
    </div>
  );
}