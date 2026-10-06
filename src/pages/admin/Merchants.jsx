import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { logAction } from "@/lib/audit";
import { notifyInternal } from "@/lib/notify";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Search, ShieldCheck, ShieldX, Eye, Loader2, Star, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AdminMerchants() {
  const { user: admin } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(""); // pending | verified
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.MerchantProfile.list("-created_date", 200)
      .then((r) => setMerchants(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return merchants.filter((m) => {
      if (q && !(m.business_name || "").includes(q)) return false;
      if (filter === "pending" && m.license_verified) return false;
      if (filter === "verified" && !m.license_verified) return false;
      return true;
    });
  }, [merchants, query, filter]);

  const viewLicense = async (m) => {
    if (!m.commercial_license_file) { toast({ title: "لا يوجد سجل مرفق" }); return; }
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: m.commercial_license_file });
      window.open(signed_url, "_blank");
    } catch (err) {
      toast({ title: err.message || "تعذّر فتح الملف", variant: "destructive" });
    }
  };

  const decide = async (m, approve) => {
    setBusy(m.id);
    try {
      await base44.entities.MerchantProfile.update(m.id, { license_verified: approve });
      if (approve) await base44.entities.User.update(m.user_id, { status: "active" });
      await notifyInternal(m.user_id, "license_review", approve ? "تمت الموافقة على حسابك" : "تم رفض السجل التجاري", approve ? "مرحباً بك كتاجر موثّق في سوق الوسيط." : "تم رفض السجل التجاري المرفوع. يرجى التواصل مع الدعم.");
      await logAction(admin, approve ? "approve_merchant" : "reject_merchant", m.business_name, m.user_id);
      toast({ title: approve ? "تمت الموافقة على التاجر" : "تم رفض التاجر" });
      load();
    } catch (err) {
      toast({ title: err.message || "فشل", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><Store className="w-6 h-6 text-gold" /> مراجعة التجار</h1>

      <div className="bg-card rounded-2xl border border-border p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث باسم المتجر..." className="h-10 w-full rounded-md border border-input bg-transparent pr-9 px-3 text-sm" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">الكل</option>
          <option value="pending">قيد المراجعة</option>
          <option value="verified">موثّقون</option>
        </select>
      </div>

      {loading ? (
        <EmptyState loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Store} title="لا يوجد تجار" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center text-navy font-extrabold text-lg shrink-0">{(m.business_name || "ت").charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy truncate">{m.business_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.region || "—"}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold fill-gold" /> {(m.rating_avg || 0).toFixed(1)}</span>
                  </div>
                </div>
                {m.license_verified ? <Badge className="bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3" /> موثّق</Badge> : <Badge className="bg-amber-100 text-amber-700">قيد المراجعة</Badge>}
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" className="h-9" onClick={() => viewLicense(m)}><Eye className="w-4 h-4" /> عرض السجل</Button>
                {!m.license_verified && (
                  <>
                    <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => decide(m, true)} disabled={busy === m.id}>
                      {busy === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} موافقة
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 text-red-600 border-red-200 hover:bg-red-50" onClick={() => decide(m, false)} disabled={busy === m.id}>
                      <ShieldX className="w-4 h-4" /> رفض
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}