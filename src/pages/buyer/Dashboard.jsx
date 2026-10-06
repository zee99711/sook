import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import { Search, Star, Store, MapPin, ChevronLeft, Package, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/merchant/EmptyState";

const CAT_ICONS = ["🛒", "🍎", "🧴", "👗", "📱", "🔧", "🏠", "🍞", "🥩", "🧀", "🥤", "🧹"];

export default function BuyerDashboard() {
  const { user, products, merchants, categories, profile, loading } = useBuyerData();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const favMerchants = (profile?.preferred_merchants || [])
    .map((id) => merchants.find((m) => m.user_id === id))
    .filter(Boolean);
  const suggested = products.slice(0, 8);

  const search = (e) => {
    e.preventDefault();
    navigate(`/buyer/browse?q=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-navy text-white p-8 sm:p-12 mb-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, hsl(var(--gold)) 0, transparent 45%)" }} />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> أهلاً {user?.display_name || user?.full_name || "بك"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">تسوّق من تجار موثّقين بكل ثقة</h1>
          <p className="text-white/75 mb-6">ابحث عن المنتجات والأسعار، أو تصفّح التجار مباشرة.</p>
          <form onSubmit={search} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="pr-11 h-12 bg-white text-navy border-0" />
            </div>
            <Button type="submit" className="h-12 px-6 bg-gold text-navy hover:bg-gold/90 font-semibold">بحث</Button>
          </form>
        </div>
      </section>

      {/* الفئات */}
      <section className="mb-8">
        <h2 className="font-bold text-navy text-lg mb-4">الفئات الرئيسية</h2>
        {categories.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {CAT_ICONS.slice(0, 6).map((emoji, i) => (
              <Link key={i} to="/buyer/browse" className="bg-card rounded-2xl border border-border p-4 text-center hover:border-gold/50 transition-colors">
                <div className="text-3xl mb-2">{emoji}</div>
                <p className="text-xs text-muted-foreground">تصفّح الكل</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((c, i) => (
              <Link key={c.id} to={`/buyer/browse?cat=${encodeURIComponent(c.name)}`} className="bg-card rounded-2xl border border-border p-4 text-center hover:border-gold/50 transition-colors">
                <div className="text-3xl mb-2">{c.icon || CAT_ICONS[i % CAT_ICONS.length]}</div>
                <p className="text-xs font-medium text-navy">{c.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* التجار المفضلون */}
      {favMerchants.length > 0 && (
        <section className="mb-8">
          <h2 className="font-bold text-navy text-lg mb-4">تجارك المفضلون</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favMerchants.map((m) => (
              <Link key={m.id} to="/buyer/merchants" className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-gold/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center text-navy font-extrabold text-lg shrink-0">
                  {(m.business_name || "ت").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-navy truncate">{m.business_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.region || "—"} · <Star className="w-3 h-3 text-gold fill-gold" /> {(m.rating_avg || 0).toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* منتجات مقترحة */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy text-lg">منتجات مقترحة</h2>
          <Link to="/buyer/browse" className="text-sm text-gold font-medium inline-flex items-center hover:underline">عرض الكل <ChevronLeft className="w-4 h-4" /></Link>
        </div>
        {loading ? (
          <EmptyState loading />
        ) : suggested.length === 0 ? (
          <EmptyState icon={Package} title="لا توجد منتجات بعد" subtitle="ستظهر المنتجات فور إضافتها من التجار" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {suggested.map((p) => (
              <ProductCard key={p.id} product={p} merchants={merchants} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ProductCard({ product, merchants }) {
  const m = merchantById(merchants, product.merchant_id);
  return (
    <Link to={`/buyer/product/${product.id}`} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/50 transition-colors group">
      <div className="aspect-square bg-secondary overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-8 h-8" /></div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-navy text-sm truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground truncate mb-2">{m?.business_name || "تاجر"}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-navy">{(product.price || 0).toLocaleString("ar-EG")} <span className="text-xs font-normal text-muted-foreground">ر.س</span></span>
          <span className="text-xs text-muted-foreground">/{product.unit}</span>
        </div>
      </div>
    </Link>
  );
}