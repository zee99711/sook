// src/pages/buyer/Merchants.jsx
import React, { useEffect, useState } from 'react';
import { Store, MapPin, Star, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { reviewsAPI } from '@/api/entities';
import { Input } from '@/components/ui/input';

export default function BuyerMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, region')
          .eq('account_type', 'merchant');

        const { data: mps } = await supabase
          .from('merchant_profiles')
          .select('user_id, business_name, description, region');

        const enriched = await Promise.all(
          (profiles || []).map(async (p) => {
            const mp = (mps || []).find((m) => m.user_id === p.id) || {};
            let rating = 0;
            try {
              rating = await reviewsAPI.averageForMerchant(p.id);
            } catch {}
            return { ...p, ...mp, rating };
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
  }, []);

  const filtered = merchants.filter((m) => {
    if (!search) return true;
    const name = (m.business_name || m.display_name || m.full_name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        icon={Store}
        title="التجار"
        subtitle={`${merchants.length} تاجر على المنصة`}
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن تاجر..."
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
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-lg">
                  {(m.business_name || m.display_name || m.full_name || 'م').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy truncate">
                    {m.business_name || m.display_name || m.full_name}
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
                  {m.rating ? m.rating.toFixed(1) : '—'}
                </span>
              </div>

              {m.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}