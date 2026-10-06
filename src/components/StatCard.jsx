import React from "react";

const tones = {
  navy: "bg-navy text-white",
  gold: "bg-gold text-navy",
  muted: "bg-secondary text-navy",
};

export default function StatCard({ icon: Icon, label, value, tone = "navy" }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-navy">{value}</p>
      </div>
    </div>
  );
}