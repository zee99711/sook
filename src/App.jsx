import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from "react-router-dom";
import RoleRoute from "@/components/RoleRoute";
import AppShell from "@/components/AppShell";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import MerchantDashboard from "@/pages/merchant/Dashboard";
import MerchantWarehouse from "@/pages/merchant/Warehouse";
import MerchantPrices from "@/pages/merchant/Prices";
import MerchantInvoices from "@/pages/merchant/Invoices";
import MerchantBrowse from "@/pages/merchant/Browse";
import BuyerDashboard from "@/pages/buyer/Dashboard";
import BuyerBrowse from "@/pages/buyer/Browse";
import BuyerOrders from "@/pages/buyer/Orders";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMerchants from "@/pages/admin/Merchants";
import AdminUsers from "@/pages/admin/Users";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminSettings from "@/pages/admin/Settings";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* منطقة التاجر */}
      <Route element={<RoleRoute allowedRoles={["merchant"]} unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell role="merchant" />}>
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/warehouse" element={<MerchantWarehouse />} />
          <Route path="/merchant/prices" element={<MerchantPrices />} />
          <Route path="/merchant/invoices" element={<MerchantInvoices />} />
          <Route path="/merchant/browse" element={<MerchantBrowse />} />
        </Route>
      </Route>

      {/* منطقة المشتري */}
      <Route element={<RoleRoute allowedRoles={["buyer"]} unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell role="buyer" />}>
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/browse" element={<BuyerBrowse />} />
          <Route path="/buyer/orders" element={<BuyerOrders />} />
        </Route>
      </Route>

      {/* منطقة الإدارة */}
      <Route element={<RoleRoute allowedRoles={["admin"]} unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/merchants" element={<AdminMerchants />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/invoices" element={<AdminInvoices />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App