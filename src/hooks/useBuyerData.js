import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

export function useBuyerData() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prods, merchs, cats, prof] = await Promise.all([
        base44.entities.Product.list("-created_date", 200),
        base44.entities.MerchantProfile.filter({ license_verified: true }),
        base44.entities.Category.list(),
        base44.entities.BuyerProfile.filter({ user_id: user.id }),
      ]);
      setProducts(prods || []);
      setMerchants(merchs || []);
      setCategories(cats || []);
      setProfile(prof && prof[0] ? prof[0] : null);
    } catch {
      // حالات فارغة في الصفحات
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { user, products, merchants, categories, profile, loading, refresh: load, setProfile };
}

export function merchantById(merchants, id) {
  return merchants.find((m) => m.user_id === id || m.id === id);
}