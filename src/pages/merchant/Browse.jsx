import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/merchant/EmptyState";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin, Store } from "lucide-react";

export default function MerchantBrowse() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");

  useEffect(() => {
    base44.entities.MerchantProfile.filter({ license_verified: true })
      .then((m) => setMerchants(m || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(() => [...new Set(merchants.map((m) => m.region).filter(Boolean))], [merchants]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return merchants.filter((m) => {
      if (q && !(m.business_name || "").includes(q)) return false;
      if (region && m.region !== region) return false;
      return true;
    });
  }, [merchants, query, region]);

  return (
    <div>
      <PageHeader title="تصفّح التجار" subtitle="استكشف التجار الموثّقين على المنصة" icon={Store} />

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

      {loading ? (
        <EmptyState loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Store} title="لا يوجد تجار" subtitle="لا يوجد تجار مطابقون حالياً" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-gold/50 transition-colors">
              <div className="h-24 bg-gradient-to-br from-navy to-[#2a3a5a] flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-navy font-extrabold text-2xl">
                  {(m.business_name || "ت").charAt(0)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-navy text-lg">{m.business_name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {m.region || "—"}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold fill-gold" /> {(m.rating_avg || 0).toFixed(1)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="px-2 py-1 rounded-md bg-secondary text-xs">باقة {planLabel(m.subscription_plan)}</span>
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><Store className="w-3 h-3" /> موثّق</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function planLabel(p) { return { free: "مجانية", basic: "أساسية", pro: "احترافية" }[p] || "مجانية"; }