import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { FileText } from "lucide-react";

export default function AdminInvoices() {
  return (
    <div>
      <PageHeader title="الفواتير" subtitle="كل فواتير المنصة" icon={FileText} />
      <ComingSoon message="إدارة الفواتير العامة قيد التطوير." />
    </div>
  );
}