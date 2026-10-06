import {
  LayoutDashboard,
  Warehouse,
  Tags,
  FileText,
  Search,
  Package,
  Store,
  Users,
  Settings,
} from "lucide-react";

export const navItems = {
  merchant: [
    { label: "لوحة التحكم", path: "/merchant/dashboard", icon: LayoutDashboard },
    { label: "المستودع", path: "/merchant/warehouse", icon: Warehouse },
    { label: "إدارة الأسعار", path: "/merchant/prices", icon: Tags },
    { label: "الفواتير", path: "/merchant/invoices", icon: FileText },
    { label: "تصفّح المنصة", path: "/merchant/browse", icon: Search },
  ],
  buyer: [
    { label: "لوحة التحكم", path: "/buyer/dashboard", icon: LayoutDashboard },
    { label: "تصفّح المنتجات", path: "/buyer/browse", icon: Search },
    { label: "طلباتي", path: "/buyer/orders", icon: Package },
  ],
  admin: [
    { label: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "التجار", path: "/admin/merchants", icon: Store },
    { label: "المستخدمون", path: "/admin/users", icon: Users },
    { label: "الفواتير", path: "/admin/invoices", icon: FileText },
    { label: "الإعدادات", path: "/admin/settings", icon: Settings },
  ],
};