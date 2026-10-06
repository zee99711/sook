import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

// يحمّل بيانات التاجر (الملف، المنتجات، الفواتير، الإشعارات) دفعة واحدة
export function useMerchantData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [p, inv, notf, prof] = await Promise.all([
        base44.entities.Product.filter({ merchant_id: user.id }),
        base44.entities.Invoice.filter({ merchant_id: user.id }),
        base44.entities.Notification.filter({ user_id: user.id }, "-created_date", 20),
        base44.entities.MerchantProfile.filter({ user_id: user.id }),
      ]);
      setProducts(p || []);
      setInvoices(inv || []);
      setNotifications(notf || []);
      setProfile(prof && prof[0] ? prof[0] : null);
    } catch {
      // تجاهل — الصفحات تعرض حالات فارغة
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { user, profile, products, invoices, notifications, loading, refresh: load, setProducts, setInvoices };
}

export function stockStatus(qty, min = 5) {
  if (qty <= 0) return "out";
  if (qty <= min) return "low";
  return "in";
}

export const stockLabels = { in: "متوفر", low: "منخفض", out: "نفد" };