import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/merchant/EmptyState";
import ProductFormModal from "@/components/merchant/ProductFormModal";
import { useMerchantData, stockStatus, stockLabels } from "@/hooks/useMerchantData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Plus, Search, Pencil, Trash2, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const stockTone = { in: "bg-emerald-100 text-emerald-700", low: "bg-amber-100 text-amber-700", out: "bg-red-100 text-red-700" };
const PAGE_SIZE = 8;

export default function MerchantWarehouse() {
  const { user, products, loading, refresh } = useMerchantData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = query.trim();
      if (q && !(p.name || "").includes(q)) return false;
      if (catFilter && p.category !== catFilter) return false;
      if (stockFilter && stockStatus(p.stock_quantity || 0) !== stockFilter) return false;
      return true;
    });
    list = list.sort((a, b) => {
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      if (sort === "price") return (a.price || 0) - (b.price || 0);
      if (sort === "stock") return (a.stock_quantity || 0) - (b.stock_quantity || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });
    return list;
  }, [products, query, catFilter, stockFilter, sort]);

  const outCount = useMemo(() => products.filter((p) => stockStatus(p.stock_quantity || 0) === "out").length, [products]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setModalOpen(true); };

  const confirmDelete = async () => {
    try {
      await base44.entities.Product.delete(deleteId);
      toast({ title: "تم حذف المنتج" });
      setDeleteId(null);
      refresh();
    } catch (err) {
      toast({ title: err.message || "فشل الحذف", variant: "destructive" });
    }
  };

  return (
    <div>
      <PageHeader
        title="المستودع"
        subtitle="إدارة المنتجات والمخزون"
        icon={Warehouse}
        action={
          <Button onClick={openAdd} className="bg-gold text-navy hover:bg-gold/90 h-11">
            <Plus className="w-4 h-4" /> إضافة منتج
          </Button>
        }
      />

      {outCount > 0 && (
        <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">يوجد {outCount} منتج نفد من المخزون — يرجى تحديث الكميات.</p>
        </div>
      )}

      {/* أدوات التصفية */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="بحث بالاسم..." className="pr-9 h-10" />
        </div>
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">كل الفئات</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">كل الحالات</option>
          <option value="in">متوفر</option>
          <option value="low">منخفض</option>
          <option value="out">نفد</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="new">الأحدث</option>
          <option value="name">الاسم</option>
          <option value="price">السعر</option>
          <option value="stock">الكمية</option>
        </select>
      </div>

      {loading ? (
        <EmptyState loading />
      ) : current.length === 0 ? (
        <EmptyState icon={Warehouse} title="لا توجد منتجات" subtitle="ابدأ بإضافة أول منتج لمتجرك" action={<Button onClick={openAdd} className="bg-gold text-navy hover:bg-gold/90">إضافة منتج</Button>} />
      ) : (
        <>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-muted-foreground">
                  <tr>
                    <th className="text-right px-4 py-3 font-medium">المنتج</th>
                    <th className="text-right px-4 py-3 font-medium">الفئة</th>
                    <th className="text-right px-4 py-3 font-medium">السعر</th>
                    <th className="text-right px-4 py-3 font-medium">الكمية</th>
                    <th className="text-right px-4 py-3 font-medium">الحالة</th>
                    <th className="text-right px-4 py-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map((p) => {
                    const st = stockStatus(p.stock_quantity || 0);
                    return (
                      <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">لا صورة</div>}
                            </div>
                            <span className="font-medium text-navy">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                        <td className="px-4 py-3 font-semibold">{(p.price || 0).toLocaleString("ar-EG")} ر.س</td>
                        <td className="px-4 py-3">{p.stock_quantity || 0} {p.unit}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md text-xs font-medium ${stockTone[st]}`}>{stockLabels[st]}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-secondary text-navy" aria-label="تعديل"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="حذف"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* التصفح */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronRight className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" disabled={page === pageCount} onClick={() => setPage(page + 1)}><ChevronLeft className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      <ProductFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refresh} product={editing} merchantId={user?.id} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}