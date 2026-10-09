// src/lib/PageNotFound.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, roleDashboardPath } from '@/lib/roles';

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const pageName = location.pathname.substring(1) || 'unknown';

  const role = getEffectiveRole(user);
  const dashboardPath = isAuthenticated ? roleDashboardPath(role) : '/';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-8xl font-light text-navy/20 leading-none">404</h1>
          <div className="h-1 w-20 bg-gold mx-auto my-4 rounded-full"></div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-navy">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground leading-relaxed">
            الصفحة{' '}
            <span className="font-medium text-navy bg-secondary px-2 py-0.5 rounded">
              /{pageName}
            </span>{' '}
            غير متوفرة في هذا التطبيق.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(dashboardPath)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            {isAuthenticated ? 'لوحة التحكم' : 'الصفحة الرئيسية'}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => {
                const role = getEffectiveRole(user);
                if (role === 'buyer') navigate('/buyer/browse');
                else if (role === 'merchant') navigate('/merchant/warehouse');
                else navigate('/admin/dashboard');
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-colors font-medium text-navy"
            >
              <Search className="w-4 h-4" />
              تصفّح
            </button>
          )}
        </div>
      </div>
    </div>
  );
}