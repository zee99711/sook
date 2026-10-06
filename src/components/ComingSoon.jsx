import React from "react";
import { Clock } from "lucide-react";

export default function ComingSoon({ message = "هذا القسم قيد التطوير وسيكون متاحاً قريباً." }) {
  return (
    <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mx-auto mb-4">
        <Clock className="w-7 h-7" />
      </div>
      <p className="text-navy font-medium">{message}</p>
    </div>
  );
}