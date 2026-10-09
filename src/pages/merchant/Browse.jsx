// src/pages/merchant/Browse.jsx
import React, { useEffect, useState } from 'react';
import { Search, Store, MapPin, Star } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { reviewsAPI } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';

export default function MerchantBrowse() {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, full_name, display_name, region, avatar_url,
            merchant_profiles:merchant_profiles!user_id(business_name, description, rating_avg, region)
          `)
          .eq('account_type', 'merchant')
          .neq('id', user?.id || '');

        if (error) throw error;

        // جلب التقييمات الفعلية
        const enriched = await Promise.all(
          (data || []).map(async (m) => {
            try {
              const avg = await reviewsAPI.averageForMerchant(m.id);
              return { ...m, actualRating: avg };
            } catch {
              return { ...m, actualRating: 0 };
            }
          })
        );

        setMerchants(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const filtered = merchants.filter((m) => {
    if (!search) return true;
    const name = m.display_name || m.full_name || '';
    const biz = m.merchant_profiles?.business_name || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      biz.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <PageHeader
        icon={Search}
        title="تصفّح التجار"
        subtitle={`${merchants.length} تاجر على المنصة`}
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو النشاط التجاري..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">لا يوجد تجار مطابقون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const mp = m.merchant_profiles?.[0] || m.merchant_profiles || {};
            return (
              <div
                key={m.id}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-lg">
                    {(m.display_name || m.full_name || 'م').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy truncate">
                      {mp.business_name || m.display_name || m.full_name}
                    </p>
                    {m.region && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {m.region}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-sm font-medium text-navy">
                    {m.actualRating ? m.actualRating.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">تقييم</span>
                </div>

                {mp.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {mp.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}