// src/lib/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'sook-market',
    public_settings: { app_name: 'سوق الوسيط' },
  });

  // تحميل بيانات المستخدم من profiles
  const loadUserProfile = async (authUser) => {
    if (!authUser) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile fetch error:', error);
      }

      // إذا ما كان في profile، نحاول ننشئه
      if (!profile) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            display_name: authUser.user_metadata?.full_name || authUser.email,
            account_type: authUser.user_metadata?.account_type || 'buyer',
          })
          .select()
          .single();
        return buildUserObject(authUser, newProfile);
      }

      return buildUserObject(authUser, profile);
    } catch (err) {
      console.error('loadUserProfile error:', err);
      return buildUserObject(authUser, null);
    }
  };

  const buildUserObject = (authUser, profile) => ({
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
    display_name: profile?.display_name || profile?.full_name || authUser.email,
    account_type: profile?.account_type || 'buyer',
    status: profile?.status || 'active',
    role: profile?.account_type === 'admin' ? 'admin' : 'user',
    phone: profile?.phone || '',
    region: profile?.region || '',
    avatar_url: profile?.avatar_url || '',
    ...profile,
  });

  // مراقبة تغير حالة الجلسة
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setIsLoadingAuth(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          const fullUser = await loadUserProfile(currentSession.user);
          if (mounted) {
            setUser(fullUser);
            setIsAuthenticated(true);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setAuthError({ type: 'unknown', message: err.message });
        }
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    };

    init();

    // الاستماع لتغيرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          const fullUser = await loadUserProfile(newSession.user);
          if (mounted) {
            setUser(fullUser);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          const fullUser = await loadUserProfile(newSession.user);
          if (mounted) setUser(fullUser);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // إعادة التحقق يدوياً
  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession?.user) {
        const fullUser = await loadUserProfile(currentSession.user);
        setUser(fullUser);
        setIsAuthenticated(true);
        setSession(currentSession);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
      }
    } catch (err) {
      console.error('checkUserAuth error:', err);
      setAuthError({ type: 'unknown', message: err.message });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  // تسجيل الخروج
  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);

      if (shouldRedirect) {
        window.location.href = '/login';
      }
    }
  };

  // إعادة التوجيه لتسجيل الدخول
  const navigateToLogin = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  // لا حاجة لتحميل إعدادات عامة من السيرفر
  const checkAppState = async () => {
    // لا شيء — الإعدادات ثابتة
  };

  const value = {
    user,
    session,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings,
    authChecked,
    logout,
    navigateToLogin,
    checkUserAuth,
    checkAppState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};