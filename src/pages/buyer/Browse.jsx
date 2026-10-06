import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import { ProductCard } from "@/pages/buyer/Dashboard";
import EmptyState from "@/components/merchant/EmptyState";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, List, Star, X, ChevronRight, ChevronLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export default function BuyerBrowse() {
  const { products, merchants, categories, loading } = useBuyerData();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("new");
  const [filters, setFilters] = useState({
    q: params.get("q") || "",
    cat: params.get("cat") || "",
    minPrice: "",
    maxPrice: "",
    region: "",
    merchant: "",
    inStock: false,
    minRating: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setFilters((f) => ({ ...f, q: params.get("q") || "", cat: params.get("cat") || "" }));
  }, [params]);

  const regions = useMemo(() => [...new Set(merchants.map((m) => m.region).filter(Boolean))], [merchants]);
  const merchantOptions = merchants.filter((m) => products.some((p) => p.merchant_id === m.user_id));

  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const setQ = (v) => { set("q", v); if (v) setParams({ q: v }); else setParams({}); };

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = filters.q.trim();
      if (q && !(p.name || "").includes(q)) return false;
      if (filters.cat && p.category !== filters.cat) return false;
      if (filters.minPrice && (p.price || 0) < Number(filters.minPrice)) return false;
      if (filters.maxPrice && (p.price || 0) > Number(filters.maxPrice)) return false;
      if (filters.inStock && (p.stock_quantity || 0) <= 0) return false;
      const m = merchantById(merchants, p.merchant_id);
      if (filters.region && m?.region !== filters.region) return false;
      if (filters.merchant && p.merchant_id !== filters.merchant) return false;
      if (filters.minRating && (m?.rating_avg || 0) < Number(filters.minRating)) return false;
      return true;
    });
    list = list.sort((a, b) => {
      if (sort === "price") return (a.price || 0) - (b.price || 0);
      if (sort === "rating") return (merchantById(merchants, b.merchant_id)?.rating_avg || 0) - (merchantById(merchants, a.merchant_id)?.rating_avg || 0);
      if (sort === "stock") return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      return new Date(b.created_date) - new Date(a.created_date);
    });
    return list;
  }, [products, merchants, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => { setFilters({ q: "", cat: "", minPrice: "", maxPrice: "", region: "", merchant: "", inStock: false, minRating: "" }); setParams({}); setPage(1); };

  return (
    <div>
      {/* شريط البحث الثابت */}
      <div className="sticky top-16 z-20 -mt-4 sm:-mt-6 lg:-mt-8 bg-background/90 backdrop-blur pb-4 mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input value={filters.q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="pr-11 h-12 text-base" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* الفلاتر الجانبية */}
        <aside className="bg-card rounded-2xl border border-border p-5 h-fit lg:sticky lg:top-32 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy">الفلاتر</h3>
            <button onClick={reset} className="text-xs text-gold hover:underline inline-flex items-center gap-1"><X className="w-3 h-3" /> مسح</button>
          </div>

          <FilterGroup label="الفئة">
            <select value={filters.cat} onChange={(e) => set("cat", e.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">الكل</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              {products.some((p) => p.category && !categories.find((c) => c.name === p.category)) && (
                [...new Set(products.map((p) => p.category).filter((c) => c && !categories.find((x) => x.name === c)))]
                  .map((c) => <option key={c} value={c}>{c}</option>)
              )}
            </select>
          </FilterGroup>

          <FilterGroup label="نطاق السعر">
            <div className="flex items-center gap-2">
              <Input type="number" placeholder="من" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} className="h-9" />
              <Input type="number" placeholder="إلى" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} className="h-9" />
            </div>
          </FilterGroup>

          <FilterGroup label="المنطقة">
            <select value={filters.region} onChange={(e) => set("region", e.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">الكل</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FilterGroup>

          <FilterGroup label="التاجر">
            <select value={filters.merchant} onChange={(e) => set("merchant", e.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">الكل</option>
              {merchantOptions.map((m) => <option key={m.id} value={m.user_id}>{m.business_name}</option>)}
            </select>
          </FilterGroup>

          <FilterGroup label="التقييم">
            <select value={filters.minRating} onChange={(e) => set("minRating", e.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">الكل</option>
              <option value="3">3 نجوم فأكثر</option>
              <option value="4">4 نجوم فأكثر</option>
              <option value="4.5">4.5 نجوم فأكثر</option>
            </select>
          </FilterGroup>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.inStock} onChange={(e) => set("inStock", e.target.checked)} className="w-4 h-4 accent-[#C9A961]" />
            <span className="text-sm">الكمية المتوفرة فقط</span>
          </label>
        </aside>

        {/* النتائج */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-muted-foreground">{filtered.length} منتج</p>
            <div className="flex items-center gap-2">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="new">الأحدث</option>
                <option value="price">الأقل سعراً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="stock">الأكثر توفراً</option>
              </select>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-navy text-white" : "text-muted-foreground"}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-navy text-white" : "text-muted-foreground"}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <EmptyState loading />
          ) : current.length === 0 ? (
            <EmptyState icon={Package} title="لا توجد نتائج" subtitle="جرّب تعديل الفلاتر أو البحث بكلمة أخرى" />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {current.map((p) => <ProductCard key={p.id} product={p} merchants={merchants} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {current.map((p) => <ProductRow key={p.id} product={p} merchants={merchants} />)}
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">صفحة {page} من {pageCount}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronRight className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" disabled={page === pageCount} onClick={() => setPage(page + 1)}><ChevronLeft className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-navy">{label}</p>
      {children}
    </div>
  );
}

function ProductRow({ product, merchants }) {
  const m = merchantById(merchants, product.merchant_id);
  return (
    <Link to={`/buyer/product/${product.id}`} className="flex gap-4 bg-card rounded-2xl border border-border p-3 hover:border-gold/50 transition-colors">
      <div className="w-20 h-20 rounded-lg bg-secondary overflow-hidden shrink-0">
        {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-6 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy">{product.name}</p>
        <p className="text-xs text-muted-foreground">{m?.business_name || "تاجر"} · {product.category || "—"}</p>
        <div className="flex items-center gap-2 mt-1">
          <Star className="w-3 h-3 text-gold fill-gold" />
          <span className="text-xs text-muted-foreground">{(m?.rating_avg || 0).toFixed(1)}</span>
          {(product.stock_quantity > 0) && <span className="text-xs text-emerald-600">متوفر</span>}
        </div>
      </div>
      <div className="text-left">
        <p className="font-bold text-navy">{(product.price || 0).toLocaleString("ar-EG")}</p>
        <p className="text-xs text-muted-foreground">ر.س / {product.unit}</p>
      </div>
    </Link>
  );
}