// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ متغيرات Supabase مفقودة!\n' +
    'تأكد من وجود VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sook-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper: الحصول على المستخدم الحالي
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

// Helper: الحصول على الجلسة الحالية
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

// Helper: تسجيل الخروج
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return !error;
}