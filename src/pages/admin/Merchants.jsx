import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Store } from "lucide-react";

export default function AdminMerchants() {
  return (
    <div>
      <PageHeader title="إدارة التجار" subtitle="مراجعة السجلات التجارية والموافقات" icon={Store} />
      <ComingSoon message="إدارة التجار ومراجعة السجلات قيد التطوير." />
    </div>
  );
}