// src/pages/merchant/Prices.jsx
import React, { useEffect, useState } from 'react';
import { Tags, Download, Printer } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { productsAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { exportCSV, printTable } from '@/lib/exportUtils';
import toast from 'react-hot-toast';

export default function MerchantPrices() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    productsAPI
      .listByMerchant(user.id)
      .then(setProducts)
      .catch(() => toast.error('فشل التحميل'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setTempPrice(p.price);
  };

  const savePrice = async (id) => {
    const newPrice = Number(tempPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('سعر غير صالح');
      return;
    }
    try {
      await productsAPI.update(id, { price: newPrice });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
      );
      toast.success('تم تحديث السعر');
      setEditingId(null);
    } catch (err) {
      toast.error('فشل التحديث');
    }
  };

  const handleExportCSV = () => {
    const headers = ['المنتج', 'الفئة', 'السعر', 'الوحدة', 'المخزون'];
    const rows = products.map((p) => [
      p.name,
      p.category || '',
      p.price,
      p.unit,
      p.stock_quantity,
    ]);
    exportCSV(`قائمة-أسعار-${new Date().toISOString().slice(0, 10)}`, headers, rows);
    toast.success('تم التصدير');
  };

  const handlePrint = () => {
    const headers = ['المنتج', 'الفئة', 'السعر', 'الوحدة', 'المخزون'];
    const rows = products.map((p) => [
      p.name,
      p.category || '—',
      `${Number(p.price).toFixed(2)} ر.س`,
      p.unit,
      p.stock_quantity,
    ]);
    printTable('قائمة الأسعار', headers, rows);
  };

  return (
    <div>
      <PageHeader
        icon={Tags}
        title="إدارة الأسعار"
        subtitle={`${products.length} منتج — انقر على السعر للتعديل السريع`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 ml-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-right p-4 font-semibold text-navy">المنتج</th>
                  <th className="text-right p-4 font-semibold text-navy">الفئة</th>
                  <th className="text-right p-4 font-semibold text-navy">السعر</th>
                  <th className="text-right p-4 font-semibold text-navy">الوحدة</th>
                  <th className="text-right p-4 font-semibold text-navy">المخزون</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="p-4 font-medium text-navy">{p.name}</td>
                    <td className="p-4 text-muted-foreground">{p.category || '—'}</td>
                    <td className="p-4">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePrice(p.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-24 h-8 rounded border border-gold px-2 text-sm"
                            autoFocus
                            dir="ltr"
                          />
                          <button
                            onClick={() => savePrice(p.id)}
                            className="text-xs text-green-600 font-medium"
                          >
                            حفظ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="font-bold text-navy hover:text-gold transition-colors"
                        >
                          {Number(p.price).toFixed(2)} ر.س
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{p.unit}</td>
                    <td className="p-4 text-muted-foreground">{p.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}