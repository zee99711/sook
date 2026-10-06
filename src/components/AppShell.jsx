import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/AuthContext";
import { navItems } from "@/lib/navConfig";
import { roleLabel } from "@/lib/roles";

export default function AppShell({ role }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const items = navItems[role] || [];

  const handleLogout = () => logout();

  const SidebarContent = (
    <div className="flex flex-col h-full bg-navy text-sidebar-foreground">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
            <span className="text-navy font-extrabold text-lg">و</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-white">سوق الوسيط</p>
            <p className="text-xs text-sidebar-foreground/70">{roleLabel(role)}</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold text-navy"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* الشريط الجانبي - سطح المكتب */}
      <aside className="fixed inset-y-0 right-0 w-64 hidden lg:block">
        {SidebarContent}
      </aside>

      {/* الشريط الجانبي - الجوال */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-64 animate-fade-in">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pr-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setOpen(true)}
              aria-label="القائمة"
            >
              <Menu className="w-6 h-6 text-navy" />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-3 pr-3 border-r border-border">
                <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
                  {(user?.display_name || user?.full_name || "م").charAt(0)}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-semibold text-navy">
                    {user?.display_name || user?.full_name || "مستخدم"}
                  </p>
                  <p className="text-xs text-muted-foreground">{roleLabel(role)}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}