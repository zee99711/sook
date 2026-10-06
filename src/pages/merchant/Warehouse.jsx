import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Warehouse } from "lucide-react";

export default function MerchantWarehouse() {
  return (
    <div>
      <PageHeader title="المستودع" subtitle="إدارة المخزون والكميات" icon={Warehouse} />
      <ComingSoon message="إدارة المستودع والمخزون قيد التطوير." />
    </div>
  );
}