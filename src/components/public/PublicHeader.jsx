import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { getEffectiveRole, roleDashboardPath } from "@/lib/roles";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
  { to: "/faq", label: "الأسئلة الشائعة" },
  { to: "/terms", label: "الشروط" },
  { to: "/privacy", label: "الخصوصية" },
];

export default function PublicHeader() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const role = getEffectiveRole(user);
  const dashboard = role ? roleDashboardPath(role) : "/login";

  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
            <span className="text-navy font-extrabold text-lg">و</span>
          </div>
          <span className="font-bold text-lg">سوق الوسيط</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? "text-gold" : "text-white/80 hover:text-white hover:bg-white/10"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild className="bg-gold text-navy hover:bg-gold/90 h-10">
              <Link to={dashboard}>لوحتي</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 h-10">
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild className="bg-gold text-navy hover:bg-gold/90 h-10">
                <Link to="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2 text-white" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-navy border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-white/85 hover:bg-white/10 text-sm"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              {isAuthenticated ? (
                <Button asChild className="flex-1 bg-gold text-navy">
                  <Link to={dashboard} onClick={() => setOpen(false)}>لوحتي</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="flex-1 border-white/30 text-white">
                    <Link to="/login" onClick={() => setOpen(false)}>دخول</Link>
                  </Button>
                  <Button asChild className="flex-1 bg-gold text-navy">
                    <Link to="/register" onClick={() => setOpen(false)}>حساب جديد</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}