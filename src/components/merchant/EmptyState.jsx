import React from "react";
import { Loader2 } from "lucide-react";

export default function EmptyState({ icon: Icon, title, subtitle, action, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-6 h-6 ml-2 animate-spin" />
        جارٍ التحميل...
      </div>
    );
  }
  return (
    <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-secondary text-navy flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <p className="text-navy font-semibold text-lg">{title}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}