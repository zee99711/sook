// src/lib/authReturnTo.js
// حماية من open redirect

export function safeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get('returnTo');
  if (!raw) return '/';

  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return '/';

    // إزالة بارامترات حساسة
    for (const p of [
      'access_token',
      'clear_access_token',
      'app_id',
      'app_base_url',
      'functions_version',
      'from_url',
    ]) {
      url.searchParams.delete(p);
    }

    const path = url.pathname + url.search;

    // منع //evil.com و /\evil.com
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
      return '/';
    }

    return path;
  } catch {
    return '/';
  }
}