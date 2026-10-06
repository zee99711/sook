import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { FileText } from "lucide-react";

export default function MerchantInvoices() {
  return (
    <div>
      <PageHeader title="الفواتير" subtitle="الفواتير الصادرة وحالات الدفع والتوصيل" icon={FileText} />
      <ComingSoon message="إدارة الفواتير قيد التطوير." />
    </div>
  );
}