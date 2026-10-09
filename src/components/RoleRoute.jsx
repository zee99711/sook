// src/components/RoleRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, roleDashboardPath } from '@/lib/roles';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-secondary border-t-gold rounded-full animate-spin"></div>
  </div>
);

export default function RoleRoute({ allowedRoles, unauthenticatedElement }) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return <Spinner />;
  }

  if (authError || !isAuthenticated) {
    return unauthenticatedElement;
  }

  if (user?.status === 'suspended') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 bg-background">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <span className="text-3xl">⛔</span>
        </div>
        <h1 className="text-xl font-bold text-navy">تم تعليق حسابك</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          تم حظر حسابك من قبل إدارة المنصة. يرجى التواصل مع الدعم لإلغاء الحظر.
        </p>
      </div>
    );
  }

  const role = getEffectiveRole(user);

  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleDashboardPath(role)} replace />;
  }

  return <Outlet />;
}