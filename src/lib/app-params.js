// src/lib/app-params.js
// إدارة معاملات التطبيق — بدون Base44

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
  !isNode &&
  new URLSearchParams(window.location.search).get('clear_access_token') === 'true';

const clearStoredAuth = () => {
  if (isNode) return;
  window.localStorage.removeItem('sook-auth');
  window.localStorage.removeItem('base44_access_token');
  window.localStorage.removeItem('token');
};

const getAppParams = () => {
  if (isClearAccessTokenRequested()) {
    clearStoredAuth();
  }

  return {
    appId: import.meta.env.VITE_SUPABASE_URL ? 'sook-market' : null,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    appBaseUrl:
      import.meta.env.VITE_APP_URL || (isNode ? '' : window.location.origin),
  };
};

export const appParams = {
  ...getAppParams(),
};