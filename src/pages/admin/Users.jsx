import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Users } from "lucide-react";

export default function AdminUsers() {
  return (
    <div>
      <PageHeader title="إدارة المستخدمين" subtitle="كل المستخدمين والأدوار والحالات" icon={Users} />
      <ComingSoon message="إدارة المستخدمين قيد التطوير." />
    </div>
  );
}