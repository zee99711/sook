import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Package } from "lucide-react";

export default function BuyerOrders() {
  return (
    <div>
      <PageHeader title="طلباتي" subtitle="متابعة الطلبات وحالات التوصيل" icon={Package} />
      <ComingSoon message="إدارة الطلبات قيد التطوير." />
    </div>
  );
}