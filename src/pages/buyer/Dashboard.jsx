import React from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import ComingSoon from "@/components/ComingSoon";
import { LayoutDashboard, Package, FileText, Star } from "lucide-react";

export default function BuyerDashboard() {
  return (
    <div>
      <PageHeader title="لوحة تحكم المشتري" subtitle="نظرة عامة على طلباتك ومشترياتك" icon={LayoutDashboard} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Package} label="طلبات نشطة" value="—" tone="navy" />
        <StatCard icon={FileText} label="إجمالي الفواتير" value="—" tone="gold" />
        <StatCard icon={Star} label="التجار المفضّلون" value="—" tone="muted" />
      </div>
      <ComingSoon message="لوحة تحكم المشتري قيد التطوير." />
    </div>
  );
}