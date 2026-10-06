import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import { useCart } from "@/context/CartContext";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, MessageSquare, ShoppingCart, Zap, Package, ChevronRight, Minus, Plus, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function BuyerProductDetail() {
  const { id } = useParams();
  const { merchants, products } = useBuyerData();
  const { add } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    base44.entities.Product.get(id)
      .then((p) => {
        setProduct(p);
        setQty(p?.min_order_qty || 1);
        if (p?.merchant_id) return base44.entities.Review.filter({ merchant_id: p.merchant_id });
      })
      .then((r) => setReviews(r || []))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <EmptyState loading />;
  if (!product) return <EmptyState icon={Package} title="المنتج غير موجود" subtitle="ربما حُذف أو الرابط غير صحيح" action={<Button asChild><Link to="/buyer/browse">العودة للتصفّح</Link></Button>} />;

  const merchant = merchantById(merchants, product.merchant_id);
  const images = product.images?.length ? product.images : [];
  const similar = products.filter((p) => p.merchant_id === product.merchant_id && p.id !== product.id).slice(0, 4);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : merchant?.rating_avg || 0;

  const addToCart = () => {
    add(product, qty);
    toast({ title: "أُضيف إلى السلة" });
  };
  const orderNow = () => {
    add(product, qty);
    navigate("/buyer/cart");
  };

  return (
    <div>
      {/* مسار التنقل */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-5">
        <Link to="/buyer/browse" className="hover:text-gold">التصفّح</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* المعرض */}
        <div>
          <div className="aspect-square rounded-2xl bg-secondary overflow-hidden border border-border mb-3">
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-16 h-16" /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeImg ? "border-gold" : "border-border"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div>
          {product.category && <Badge className="bg-secondary text-navy mb-2">{product.category}</Badge>}
          <h1 className="text-2xl font-bold text-navy mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 text-gold fill-gold" /> {avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{reviews.length} تقييم</span>
          </div>
          <p className="text-3xl font-extrabold text-navy mb-1">{(product.price || 0).toLocaleString("ar-EG")} <span className="text-base font-normal text-muted-foreground">ر.س / {product.unit}</span></p>
          <p className="text-sm text-muted-foreground mb-4">الحد الأدنى للطلب: {product.min_order_qty || 1} {product.unit}</p>
          <p className="text-foreground/80 leading-relaxed mb-6 whitespace-pre-line">{product.description || "لا يوجد وصف."}</p>

          {/* الكمية */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-medium text-navy">الكمية</span>
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty((q) => Math.max(product.min_order_qty || 1, q - 1))} className="p-2 hover:bg-secondary"><Minus className="w-4 h-4" /></button>
              <Input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="h-10 w-16 text-center border-0 focus-visible:ring-0" />
              <button onClick={() => setQty((q) => q + 1)} className="p-2 hover:bg-secondary"><Plus className="w-4 h-4" /></button>
            </div>
            <span className="text-sm text-muted-foreground">الإجمالي: <b className="text-navy">{((product.price || 0) * qty).toLocaleString("ar-EG")} ر.س</b></span>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={orderNow} className="h-12 flex-1 min-w-[140px] bg-gold text-navy hover:bg-gold/90 font-semibold"><Zap className="w-4 h-4" /> اطلب الآن</Button>
            <Button onClick={addToCart} variant="outline" className="h-12 flex-1 min-w-[140px]"><ShoppingCart className="w-4 h-4" /> أضف للسلة</Button>
          </div>

          {/* بطاقة التاجر */}
          {merchant && (
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold flex items-center justify-center text-navy font-extrabold text-xl shrink-0">
                {(merchant.business_name || "ت").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy">{merchant.business_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {merchant.region || "—"}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> {(merchant.rating_avg || 0).toFixed(1)}</span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="h-9">
                <Link to={`/buyer/chat?merchant=${merchant.user_id}`}><MessageSquare className="w-4 h-4" /> محادثة</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* منتجات مشابهة */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="font-bold text-navy text-lg mb-4">منتجات مشابهة من نفس التاجر</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map((p) => (
              <Link key={p.id} to={`/buyer/product/${p.id}`} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/50 transition-colors">
                <div className="aspect-square bg-secondary overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-8 text-muted-foreground" />}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-navy text-sm truncate">{p.name}</p>
                  <p className="font-bold text-navy mt-1">{(p.price || 0).toLocaleString("ar-EG")} <span className="text-xs font-normal text-muted-foreground">ر.س</span></p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}