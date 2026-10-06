import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Upload, Loader2, ImagePlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UNITS = ["قطعة", "كيلو", "علبة", "كرتون", "متر", "لتر", "كيس"];

export default function ProductFormModal({ open, onClose, onSaved, product, merchantId }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    unit: "قطعة",
    stock_quantity: "",
    min_order_qty: "1",
  });
  const [images, setImages] = useState([]); // {url, file?}
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    if (open) {
      base44.entities.Category.list().then((c) => setCats(c || [])).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        category: product.category || "",
        description: product.description || "",
        price: product.price ?? "",
        unit: product.unit || "قطعة",
        stock_quantity: product.stock_quantity ?? "",
        min_order_qty: product.min_order_qty ?? 1,
      });
      setImages((product.images || []).map((url) => ({ url })));
    } else {
      setForm({ name: "", category: "", description: "", price: "", unit: "قطعة", stock_quantity: "", min_order_qty: "1" });
      setImages([]);
    }
  }, [product, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFiles = async (files) => {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        uploaded.push({ url: file_url });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast({ title: "تعذّر رفع الصور", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.price === "" || form.stock_quantity === "") {
      toast({ title: "يرجى تعبئة الاسم والسعر والكمية", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        merchant_id: merchantId,
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        unit: form.unit,
        stock_quantity: Number(form.stock_quantity) || 0,
        min_order_qty: Number(form.min_order_qty) || 1,
        images: images.map((i) => i.url),
      };
      if (isEdit) {
        await base44.entities.Product.update(product.id, payload);
      } else {
        await base44.entities.Product.create(payload);
      }
      toast({ title: isEdit ? "تم تحديث المنتج" : "تمت إضافة المنتج" });
      onSaved();
      onClose();
    } catch (err) {
      toast({ title: err.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم المنتج *</Label>
              <Input value={form.name} onChange={set("name")} className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Input list="cats" value={form.category} onChange={set("category")} className="h-11" placeholder="اختر أو اكتب فئة" />
              <datalist id="cats">
                {cats.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea rows={3} value={form.description} onChange={set("description")} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>السعر *</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label>الوحدة</Label>
              <select value={form.unit} onChange={set("unit")} className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>الكمية *</Label>
              <Input type="number" min="0" value={form.stock_quantity} onChange={set("stock_quantity")} className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label>حد أدنى للطلب</Label>
              <Input type="number" min="1" value={form.min_order_qty} onChange={set("min_order_qty")} className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>صور المنتج</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-gold text-muted-foreground">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                <span className="text-[10px] mt-1">إضافة</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">صور المنتج تُرفع كملفات عامة ليعرضها المشتريون في المتجر.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-gold text-navy hover:bg-gold/90" disabled={saving || uploading}>
              {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}