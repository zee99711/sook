import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/merchant/EmptyState";
import { useMerchantData } from "@/hooks/useMerchantData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tags, FileSpreadsheet, FileText, Check, Loader2, Search } from "lucide-react";
import { exportCSV, printTable } from "@/lib/exportUtils";
import { toast } from "@/components/ui/use-toast";

export default function MerchantPrices() {
  const { products, loading, refresh } = useMerchantData();
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    return products.filter((p) => !q || (p.name || "").includes(q));
  }, [products, query]);

  const startEdit = (p) => { setEditId(p.id); setDraft(String(p.price ?? "")); };
  const savePrice = async (p) => {
    const val = Number(draft);
    if (isNaN(val) || val < 0) { toast({ title: "سعر غير صالح", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await base44.entities.Product.update(p.id, { price: val });
      toast({ title: "تم تحديث السعر" });
      setEditId(null);
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل التحديث", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    exportCSV("قائمة-الأسعار", ["المنتج", "الفئة", "السعر", "الوحدة", "حد الطلب"], filtered.map((p) => [p.name, p.category || "", p.price, p.unit, p.min_order_qty]));
  };
  const handleExportPDF = () => {
    printTable("قائمة الأسعار", ["المنتج", "الفئة", "السعر", "الوحدة"], filtered.map((p) => [p.name, p.category || "—", `${p.price} ر.س`, p.unit]));
  };

  return (
    <div>
      <PageHeader
        title="إدارة الأسعار"
        subtitle="تعديل سريع لأسعار المنتجات وتصدير القائمة"
        icon={Tags}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel} className="h-11"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
            <Button variant="outline" onClick={handleExportPDF} className="h-11"><FileText className="w-4 h-4" /> PDF</Button>
          </div>
        }
      />

      <div className="relative max-w-sm mb-5">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث عن منتج..." className="pr-9 h-10" />
      </div>

      {loading ? (
        <EmptyState loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Tags} title="لا توجد منتجات" subtitle="أضف منتجات من صفحة المستودع أولاً" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا صورة</div>}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-navy truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category || "بدون فئة"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {editId === p.id ? (
                  <div className="flex items-center gap-2">
                    <Input type="number" value={draft} onChange={(e) => setDraft(e.target.value)} className="h-9 w-28" autoFocus onKeyDown={(e) => e.key === "Enter" && savePrice(p)} />
                    <Button size="icon" className="h-9 w-9 bg-gold text-navy hover:bg-gold/90" onClick={() => savePrice(p)} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</Button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} className="text-xl font-bold text-navy hover:text-gold transition-colors">
                      {(p.price || 0).toLocaleString("ar-EG")} <span className="text-sm font-normal text-muted-foreground">ر.س / {p.unit}</span>
                    </button>
                    <span className="text-xs text-muted-foreground">اضغط للتعديل</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}