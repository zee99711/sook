import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/merchant/EmptyState";
import { useMerchantData } from "@/hooks/useMerchantData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, X, Download, Printer, Loader2 } from "lucide-react";
import { printInvoice } from "@/lib/exportUtils";
import { toast } from "@/components/ui/use-toast";

const payLabel = { unpaid: "غير مدفوع", partial: "مدفوع جزئياً", paid: "مدفوع" };
const payTone = { unpaid: "bg-red-100 text-red-700", partial: "bg-amber-100 text-amber-700", paid: "bg-emerald-100 text-emerald-700" };
const delivLabel = { pending: "بانتظار الموافقة", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم" };

export default function MerchantInvoices() {
  const { user, invoices, loading, refresh } = useMerchantData();
  const [busy, setBusy] = useState(null);

  const tabs = useMemo(
    () => ({
      new: invoices.filter((i) => i.delivery_status === "pending" && i.status !== "cancelled"),
      delivering: invoices.filter((i) => ["preparing", "shipped"].includes(i.delivery_status)),
      completed: invoices.filter((i) => i.delivery_status === "delivered"),
    }),
    [invoices]
  );

  const act = async (invoice, patch, msg) => {
    setBusy(invoice.id);
    try {
      await base44.entities.Invoice.update(invoice.id, patch);
      toast({ title: msg });
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const buyerRef = (id) => (id ? `مشتري #${id.slice(-4)}` : "—");

  const handlePDF = (inv) => printInvoice(inv, buyerRef(inv.buyer_id), user?.display_name || "تاجر", inv.items || []);

  const renderTable = (list, kind) => (
    list.length === 0 ? (
      <EmptyState icon={FileText} title="لا توجد فواتير" subtitle="ستظهر هنا عند استلام طلبات جديدة" />
    ) : (
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-right px-4 py-3 font-medium">رقم الفاتورة</th>
                <th className="text-right px-4 py-3 font-medium">المشتري</th>
                <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                <th className="text-right px-4 py-3 font-medium">المجموع</th>
                <th className="text-right px-4 py-3 font-medium">طريقة الدفع</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => (
                <tr key={inv.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{inv.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{buyerRef(inv.buyer_id)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.created_date).toLocaleDateString("ar-EG")}</td>
                  <td className="px-4 py-3 font-semibold">{(inv.total || 0).toLocaleString("ar-EG")} ر.س</td>
                  <td className="px-4 py-3">{inv.payment_method || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${payTone[inv.payment_status] || "bg-secondary"}`}>{payLabel[inv.payment_status] || inv.payment_status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {kind === "new" && (
                        <>
                          <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => act(inv, { delivery_status: "preparing" }, "تم تأكيد الطلب")} disabled={busy === inv.id}>
                            {busy === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} تأكيد
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => act(inv, { status: "cancelled" }, "تم رفض الطلب")} disabled={busy === inv.id}>
                            <X className="w-3 h-3" /> رفض
                          </Button>
                        </>
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
      </div>
    )
  );

  return (
    <div>
      <PageHeader title="الفواتير" subtitle="إدارة الطلبات والفواتير وحالات التسليم" icon={FileText} />
      <Tabs defaultValue="new">
        <TabsList className="bg-card border border-border p-1">
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