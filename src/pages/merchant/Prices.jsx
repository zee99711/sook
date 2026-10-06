import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Tags } from "lucide-react";

export default function MerchantPrices() {
  return (
    <div>
      <PageHeader title="إدارة الأسعار" subtitle="تحديث أسعار المنتجات وحدود الطلب" icon={Tags} />
      <ComingSoon message="إدارة الأسعار قيد التطوير." />
    </div>
  );
}