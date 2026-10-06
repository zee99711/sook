import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useBuyerData } from "@/hooks/useBuyerData";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Search, Star, MapPin, Heart, MessageSquare, HeartOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function BuyerMerchants() {
  const { user, merchants, products, profile, refresh } = useBuyerData();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const navigate = useNavigate();

  const favs = profile?.preferred_merchants || [];

  const regions = useMemo(() => [...new Set(merchants.map((m) => m.region).filter(Boolean))], [merchants]);
  const productCount = (mid) => products.filter((p) => p.merchant_id === mid).length;

  const filtered = useMemo(() => {
    const q = query.trim();
    return merchants.filter((m) => {
      if (q && !(m.business_name || "").includes(q)) return false;
      if (region && m.region !== region) return false;
      return true;
    });
  }, [merchants, query, region]);

  const ensureProfile = async () => {
    if (profile) return profile;
    const created = await base44.entities.BuyerProfile.create({ user_id: user.id, buyer_type: "general", preferred_merchants: [] });
    refresh();
    return created;
  };

  const toggleFav = async (m) => {
    try {
      const prof = await ensureProfile();
      const list = prof.preferred_merchants || [];
      const next = list.includes(m.user_id) ? list.filter((x) => x !== m.user_id) : [...list, m.user_id];
      await base44.entities.BuyerProfile.update(prof.id, { preferred_merchants: next });
      refresh();
      toast({ title: list.includes(m.user_id) ? "أُزيل من المفضلة" : "أُضيف للمفضلة" });
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><Store className="w-6 h-6 text-gold" /> تصفّح التجار</h1>

      <div className="bg-card rounded-2xl border border-border p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث باسم المتجر..." className="pr-9 h-10" />
        </div>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">كل المناطق</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Store} title="لا يوجد تجار" subtitle="لا يوجد تجار موثّقون مطابقون حالياً" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => {
            const isFav = favs.includes(m.user_id);
            return (
              <div key={m.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/50 transition-colors">
                <div className="h-24 bg-gradient-to-br from-navy to-[#2a3a5a] flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-navy font-extrabold text-2xl">{(m.business_name || "ت").charAt(0)}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-navy text-lg">{m.business_name}</h3>
                    <button onClick={() => toggleFav(m)} className={`p-2 rounded-lg transition ${isFav ? "text-red-500 bg-red-50" : "text-muted-foreground hover:bg-secondary"}`}>
                      {isFav ? <Heart className="w-5 h-5 fill-red-500" /> : <Heart className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {m.region || "—"}</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold fill-gold" /> {(m.rating_avg || 0).toFixed(1)}</span>
                    <span>{productCount(m.user_id)} منتج</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" className="flex-1 h-10"><Link to={`/buyer/browse?merchant=${m.user_id}`}>منتجات</Link></Button>
                    <Button asChild className="flex-1 h-10 bg-gold text-navy hover:bg-gold/90"><Link to={`/buyer/chat?merchant=${m.user_id}`}><MessageSquare className="w-4 h-4" /> محادثة</Link></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}