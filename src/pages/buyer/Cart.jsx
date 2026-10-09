// src/pages/buyer/Cart.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, Store } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { invoicesAPI, productsAPI } from '@/api/entities';
import { getCommissions, orderTotals } from '@/lib/commissions';
import { notifyMerchantNewOrder } from '@/lib/notify';
import { generateInvoiceNumber, generateAndSaveInvoicePDF } from '@/lib/invoiceUtils';
import { PAYMENT_METHODS } from '@/lib/buyerConstants';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function BuyerCart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQty, removeItem, clearCart, itemsByMerchant, subtotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const groups = itemsByMerchant();
  const merchantIds = Object.keys(groups);

  if (items.length === 0) {
    return (
      <div>
        <PageHeader icon={ShoppingCart} title="سلة المشتري" />
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-navy font-medium mb-2">السلة فارغة</p>
          <p className="text-sm text-muted-foreground mb-4">
            ابدأ بتصفح المنتجات وأضف ما تريد
          </p>
          <Button
            onClick={() => navigate('/buyer/browse')}
            className="bg-navy text-white hover:bg-navy/90"
          >
            تصفح المنتجات
          </Button>
        </div>
      </div>
    );
  }

  const submitOrder = async () => {
    if (!user?.id) return;
    setSubmitting(true);

    try {
      const commissions = await getCommissions();
      const createdInvoices = [];

      // إنشاء فاتورة لكل تاجر
      for (const merchantId of merchantIds) {
        const merchantItems = groups[merchantId];
        const merchantSubtotal = merchantItems.reduce(
          (s, it) => s + Number(it.product.price) * it.qty,
          0
        );

        const totals = orderTotals(merchantSubtotal, paymentMethod, commissions);
        const invoiceNumber = generateInvoiceNumber();

        // 1. إنشاء الفاتورة
        const invoice = await invoicesAPI.create({
          invoice_number: invoiceNumber,
          merchant_id: merchantId,
          buyer_id: user.id,
          subtotal: totals.subtotal,
          commission: totals.commission,
          tax: totals.tax,
          total: totals.total,
          net_merchant: totals.net,
          payment_method: paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          notes: notes || null,
        });

        // 2. إنشاء البنود
        for (const it of merchantItems) {
          await supabase.from('invoice_items').insert({
            invoice_id: invoice.id,
            product_id: it.product.id,
            name: it.product.name,
            qty: it.qty,
            unit_price: it.product.price,
            subtotal: Number(it.product.price) * it.qty,
          });

          // 3. تحديث المخزون
          try {
            await productsAPI.update(it.product.id, {
              stock_quantity: Math.max(0, it.product.stock_quantity - it.qty),
            });
          } catch (e) {
            console.warn('Stock update failed:', e);
          }
        }

        // 4. إشعار التاجر
        const buyerName = user.display_name || user.full_name || 'مشتري';
        await notifyMerchantNewOrder({ ...invoice, total: totals.total }, buyerName);

        createdInvoices.push(invoice);
      }

      clearCart();
      toast.success(`تم إنشاء ${createdInvoices.length} طلب`);
      navigate('/buyer/orders');
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error('فشل إرسال الطلب — حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={ShoppingCart}
        title="سلة المشتري"
        subtitle={`${items.length} منتج من ${merchantIds.length} تاجر`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العناصر */}
        <div className="lg:col-span-2 space-y-4">
          {merchantIds.map((merchantId) => {
            const merchantItems = groups[merchantId];
            const merchantName = merchantItems[0].product.merchant_name || 'تاجر';
            return (
              <div key={merchantId} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <Store className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium text-navy">{merchantName}</span>
                </div>

                <div className="space-y-3">
                  {merchantItems.map((it) => (
                    <div key={it.product.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden shrink-0">
                        {it.product.images?.[0] ? (
                          <img
                            src={it.product.images[0]}
                            alt={it.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy truncate">
                          {it.product.name}
                        </p>
                        <p className="text-xs text-gold font-bold mt-1">
                          {Number(it.product.price).toFixed(2)} ر.س / {it.product.unit}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(it.product.id, it.qty - 1)}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-secondary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium" dir="ltr">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => updateQty(it.product.id, it.qty + 1)}
                          className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-secondary"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(it.product.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* الملخص */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-4">
            <h3 className="font-bold text-navy">ملخص الطلب</h3>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                طريقة الدفع
              </label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === m.id
                        ? 'border-gold bg-gold/5'
                        : 'border-border hover:border-gold/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-gold"
                    />
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-sm font-medium flex-1">{m.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {(m.commission * 100).toFixed(1)}%
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">ملاحظات</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background p-2 text-sm"
                placeholder="أي تعليمات خاصة..."
              />
            </div>

            <Button
              onClick={submitOrder}
              disabled={submitting}
              className="w-full bg-navy text-white hover:bg-navy/90 h-11"
            >
              {submitting ? 'جارٍ إرسال الطلب...' : 'تأكيد الطلب'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              سيتم إخطار التجار لمراجعة طلبك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}