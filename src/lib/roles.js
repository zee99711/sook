// src/lib/roles.js
// أدوار التطبيق: نعتمد حقل account_type المخصص

export const getEffectiveRole = (user) => {
  if (!user) return null;
  if (user.account_type) return user.account_type;
  if (user.role === 'admin') return 'admin';
  return 'buyer';
};

export const roleDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'merchant':
      return '/merchant/dashboard';
    case 'buyer':
      return '/buyer/dashboard';
    default:
      return '/';
  }
};

export const roleLabel = (role) =>
  ({
    admin: 'مدير المنصة',
    merchant: 'تاجر',
    buyer: 'مشتري',
  }[role] || 'زائر');

export const roleColor = (role) =>
  ({
    admin: 'bg-red-100 text-red-800',
    merchant: 'bg-gold/20 text-navy',
    buyer: 'bg-navy/10 text-navy',
  }[role] || 'bg-gray-100 text-gray-800');