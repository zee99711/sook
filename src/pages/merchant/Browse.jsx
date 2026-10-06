import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Search } from "lucide-react";

export default function MerchantBrowse() {
  return (
    <div>
      <PageHeader title="تصفّح المنصة" subtitle="استكشف منتجات التجار الآخرين" icon={Search} />
      <ComingSoon message="تصفّح منتجات المنصة قيد التطوير." />
    </div>
  );
}