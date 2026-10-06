// أدوار التطبيق: نعتمد حقل account_type المخصص (قابل للضبط الذاتي عند التسجيل)
// بدل الحقل المدمج role الذي لا يمكن للمستخدم تغييره بنفسه.

export const getEffectiveRole = (user) => {
  if (!user) return null;
  if (user.account_type) return user.account_type;
  if (user.role === "admin") return "admin";
  return "buyer";
};

export const roleDashboardPath = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "merchant":
      return "/merchant/dashboard";
    case "buyer":
      return "/buyer/dashboard";
    default:
      return "/";
  }
};

export const roleLabel = (role) =>
  ({
    admin: "مدير المنصة",
    merchant: "تاجر",
    buyer: "مشتري",
  }[role] || "زائر");