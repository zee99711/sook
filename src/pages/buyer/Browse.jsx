import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Search } from "lucide-react";

export default function BuyerBrowse() {
  return (
    <div>
      <PageHeader title="تصفّح المنتجات" subtitle="استكشف المنتجات والأسعار من التجار" icon={Search} />
      <ComingSoon message="تصفّح المنتجات قيد التطوير." />
    </div>
  );
}