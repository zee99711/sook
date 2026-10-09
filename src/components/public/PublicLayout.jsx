// src/components/public/PublicLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, roleDashboardPath } from '@/lib/roles';

export default function PublicLayout() {
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'من نحن', path: '/about' },
    { label: 'اتصل بنا', path: '/contact' },
    { label: 'الأسئلة الشائعة', path: '/faq' },
  ];

  const isActive = (path) => location.pathname === path;

  const dashboardPath = isAuthenticated
    ? roleDashboardPath(getEffectiveRole(user))
    : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center">
                <span className="text-gold font-extrabold text-lg">و</span>
              </div>
              <span className="font-bold text-navy text-lg hidden sm:block">
                سوق الوسيط
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-navy/5 text-navy'
                      : 'text-muted-foreground hover:text-navy hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  to={dashboardPath}
                  className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy/90 text-sm font-medium"
                >
                  لوحة التحكم
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-navy hover:bg-secondary text-sm font-medium"
                  >
                    دخول
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy/90 text-sm font-medium"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary"
              aria-label="القائمة"
            >
              {mobileOpen ? (
                <X className="w-6 h-6 text-navy" />
              ) : (
                <Menu className="w-6 h-6 text-navy" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden py-4 border-t border-border space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-navy/5 text-navy'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border flex gap-2">
                {isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    className="flex-1 text-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium"
                  >
                    لوحة التحكم
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex-1 text-center px-4 py-2 rounded-lg border border-border text-navy text-sm font-medium"
                    >
                      <LogIn className="w-4 h-4 mx-auto mb-1" />
                      دخول
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium"
                    >
                      <UserPlus className="w-4 h-4 mx-auto mb-1" />
                      تسجيل
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
                  <span className="text-navy font-extrabold text-lg">و</span>
                </div>
                <span className="font-bold text-lg">سوق الوسيط</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                منصة عربية متكاملة للتجارة بين الشركات (B2B) تربط التجار الموثّقين
                بالمشترين، مع إدارة كاملة للمنتجات والفواتير والمحادثات في مكان آمن ورسمي.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to="/about" className="hover:text-gold">
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-gold">
                    الأسئلة الشائعة
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-gold">
                    اتصل بنا
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-gold">
                    الشروط والأحكام
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">قانوني</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to="/privacy" className="hover:text-gold">
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-gold">
                    اتفاقية الاستخدام
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-white/50">
            © {new Date().getFullYear()} سوق الوسيط — جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}