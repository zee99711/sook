import React from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import ComingSoon from "@/components/ComingSoon";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Package, FileText, TrendingUp, Clock, ShieldAlert } from "lucide-react";

export default function MerchantDashboard() {
  const { user } = useAuth();
  const pending = user?.status === "pending_review";

  return (
    <div>
      <PageHeader
        title="لوحة تحكم التاجر"
        subtitle="نظرة عامة على نشاطك التجاري"
        icon={LayoutDashboard}
      />

      {pending && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-gold/10 border border-gold/30">
          <ShieldAlert className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-navy">حسابك قيد المراجعة</p>
            <p className="text-sm text-muted-foreground">
              يتم الآن مراجعة السجل التجاري المرفوع من قبل إدارة المنصة. ستتمكن من إضافة المنتجات فور الموافقة.
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="عدد المنتجات" value="—" tone="navy" />
        <StatCard icon={FileText} label="الفواتير الصادرة" value="—" tone="gold" />
        <StatCard icon={TrendingUp} label="مبيعات الشهر" value="—" tone="muted" />
        <StatCard icon={Clock} label="طلبات معلّقة" value="—" tone="navy" />
      </div>

      <ComingSoon message="لوحة التحكم التفصيلية قيد التطوير — ستعرض المنتجات والفواتير والإحصائيات قريباً." />
    </div>
  );
}