import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getEffectiveRole, roleDashboardPath } from "@/lib/roles";

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

  const role = getEffectiveRole(user);

  if (!allowedRoles.includes(role)) {
    return <Navigate to={roleDashboardPath(role)} replace />;
  }

  return <Outlet />;
}