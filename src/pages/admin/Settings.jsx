import React from "react";
import PageHeader from "@/components/PageHeader";
import ComingSoon from "@/components/ComingSoon";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div>
      <PageHeader title="إعدادات المنصة" subtitle="الإعدادات العامة وخطط الاشتراك" icon={Settings} />
      <ComingSoon message="إعدادات المنصة قيد التطوير." />
    </div>
  );
}