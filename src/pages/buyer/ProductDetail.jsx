// src/pages/buyer/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ShoppingCart, Store, MapPin, ArrowRight, Minus, Plus } from 'lucide-react';
import { productsAPI } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function BuyerProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const prod = await productsAPI.get(id);
        setProduct(prod);
        setQty(prod.min_order_qty || 1);

        if (prod.merchant_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, display_name, full_name')
            .eq('id', prod.merchant_id)
            .single();

          const { data: mp } = await supabase
            .from('merchant_profiles')
            .select('business_name, region, description')
            .eq('user_id', prod.merchant_id)
            .single();

          setMerchant({ ...profile, ...mp });
        }
      } catch (err) {
        console.error(err);
        toast.error('فشل تحميل المنتج');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock_quantity < qty) {
      toast.error('الكمية المطلوبة غير متوفرة');
      return;
    }
    addItem(product, qty);
    toast.success(`تمت إضافة ${qty} إلى السلة`);
  };

  const handleBuyNow = () => {
    if (product.stock_quantity < qty) {
      toast.error('الكمية المطلوبة غير متوفرة');
      return;
    }
    addItem(product, qty);
    navigate('/buyer/cart');
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">المنتج غير موجود</p>
        <Link to="/buyer/browse" className="text-gold hover:underline mt-3 inline-block">
          العودة للتصفح
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [null];

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mb-4"
      >
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* الصور */}
        <div>
          <div className="aspect-square bg-secondary rounded-2xl overflow-hidden mb-3">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-gold' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-3">{product.name}</h1>

          {merchant && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Store className="w-4 h-4" />
              <span>{merchant.business_name || merchant.display_name || 'تاجر'}</span>
              {merchant.region && (
                <>
                  <span>·</span>
                  <MapPin className="w-3 h-3" />
                  <span>{merchant.region}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gold">
              {Number(product.price).toFixed(2)} ر.س
            </span>
            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>

          {product.description && (
            <div className="bg-secondary/40 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المخزون المتاح</span>
              <span
                className={`font-medium ${
                  product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.stock_quantity} {product.unit}
              </span>
            </div>
            {product.min_order_qty > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الحد الأدنى للطلب</span>
                <span className="font-medium text-navy">
                  {product.min_order_qty} {product.unit}
                </span>
              </div>
            )}
          </div>

          {/* الكمية */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground block mb-2">الكمية</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(Math.max(product.min_order_qty || 1, qty - 1))}
                className="w-10 h-10 rounded-lg border border-border hover:bg-secondary flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-20 h-10 rounded-lg border border-border text-center font-bold"
                dir="ltr"
              />
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 rounded-lg border border-border hover:bg-secondary flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground mr-2">{product.unit}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="flex-1 h-12 text-base"
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              أضف للسلة
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 h-12 text-base bg-navy text-white hover:bg-navy/90"
              disabled={product.stock_quantity <= 0}
            >
              اطلب الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}