// src/pages/merchant/Warehouse.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Warehouse as WarehouseIcon, Package } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { productsAPI, categoriesAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '',
  category: '',
  description: '',
  price: 0,
  unit: 'قطعة',
  stock_quantity: 0,
  min_order_qty: 1,
  images: [],
};

export default function MerchantWarehouse() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const load = async () => {
    if (!user?.id) return;
    try {
      const [prods, cats] = await Promise.all([
        productsAPI.listByMerchant(user.id),
        categoriesAPI.list(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error('فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCategory]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || 0,
      unit: product.unit || 'قطعة',
      stock_quantity: product.stock_quantity || 0,
      min_order_qty: product.min_order_qty || 1,
      images: product.images || [],
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('اسم المنتج مطلوب');
      return;
    }
    if (form.price <= 0) {
      toast.error('السعر يجب أن يكون أكبر من 0');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await productsAPI.update(editing.id, form);
        toast.success('تم تحديث المنتج');
      } else {
        await productsAPI.create({ ...form, merchant_id: user.id });
        toast.success('تمت إضافة المنتج');
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await productsAPI.remove(id);
      toast.success('تم الحذف');
      load();
    } catch (err) {
      toast.error('فشل الحذف');
    }
  };

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <PageHeader
        icon={WarehouseIcon}
        title="المستودع"
        subtitle={`${products.length} منتج في المستودع`}
        action={
          <Button
            onClick={openCreate}
            className="bg-navy text-white hover:bg-navy/90"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج
          </Button>
        }
      />

      {/* فلاتر */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]"
        >
          <option value="">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* الجدول */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-navy font-medium mb-2">لا توجد منتجات</p>
          <p className="text-sm text-muted-foreground mb-4">
            ابدأ بإضافة أول منتج لمستودعك
          </p>
          <Button onClick={openCreate} className="bg-navy text-white">
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-right p-4 font-semibold text-navy">المنتج</th>
                  <th className="text-right p-4 font-semibold text-navy">الفئة</th>
                  <th className="text-right p-4 font-semibold text-navy">السعر</th>
                  <th className="text-right p-4 font-semibold text-navy">المخزون</th>
                  <th className="text-right p-4 font-semibold text-navy">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="p-4">
                      <p className="font-medium text-navy">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{p.category || '—'}</td>
                    <td className="p-4 font-semibold text-navy">
                      {Number(p.price).toFixed(2)} ر.س
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.stock_quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : p.stock_quantity < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {p.stock_quantity} {p.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-secondary text-navy"
                          aria-label="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل منتج' : 'إضافة منتج'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>اسم المنتج *</Label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="مثال: زيت دوار الشمس 1 لتر"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>الفئة</Label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>الوحدة</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => update('unit', e.target.value)}
                  placeholder="قطعة، كرتونة، كيلو..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>السعر *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update('price', Number(e.target.value))}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>المخزون</Label>
                <Input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => update('stock_quantity', Number(e.target.value))}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>حد أدنى للطلب</Label>
                <Input
                  type="number"
                  value={form.min_order_qty}
                  onChange={(e) => update('min_order_qty', Number(e.target.value))}
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label>الوصف</Label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background p-3 text-sm"
                placeholder="وصف تفصيلي للمنتج..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-navy text-white hover:bg-navy/90"
            >
              {saving ? 'جارٍ الحفظ...' : editing ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}