import React from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import ComingSoon from "@/components/ComingSoon";
import { LayoutDashboard, Store, Users, FileText } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="لوحة تحكم الإدارة" subtitle="إجماليات المنصة والمراجعات" icon={LayoutDashboard} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Store} label="التجار" value="—" tone="navy" />
        <StatCard icon={Users} label="المستخدمون" value="—" tone="gold" />
        <StatCard icon={FileText} label="الفواتير" value="—" tone="muted" />
        <StatCard icon={Store} label="تجار قيد المراجعة" value="—" tone="navy" />
      </div>
      <ComingSoon message="لوحة تحكم الإدارة قيد التطوير." />
    </div>
  );
}