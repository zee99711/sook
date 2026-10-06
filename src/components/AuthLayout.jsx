import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-[#0f1a30] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold mb-4 shadow-lg shadow-gold/20">
            {Icon ? (
              <Icon className="w-8 h-8 text-navy" aria-hidden="true" />
            ) : (
              <span className="text-navy font-extrabold text-2xl">و</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/70 mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">{children}</div>
        {footer && <p className="text-center text-sm text-white/60 mt-6">{footer}</p>}
      </div>
    </div>
  );
}