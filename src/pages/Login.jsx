// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, roleDashboardPath } from '@/lib/roles';
import { safeReturnTo } from '@/lib/authReturnTo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // إذا كان المستخدم مسجل دخول مسبقاً
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user) {
      const role = getEffectiveRole(user);
      const returnTo = safeReturnTo();
      const target = returnTo && returnTo !== '/' ? returnTo : roleDashboardPath(role);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (!data.user) {
        throw new Error('فشل تسجيل الدخول — لا توجد بيانات مستخدم');
      }

      // التحقق من حالة الحساب
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, status')
        .eq('id', data.user.id)
        .single();

      if (profile?.status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error('تم تعليق حسابك. يرجى التواصل مع الإدارة.');
      }

      // إعادة التوجيه
      const role = profile?.account_type || 'buyer';
      const returnTo = safeReturnTo();
      const target = returnTo && returnTo !== '/' ? returnTo : roleDashboardPath(role);
      navigate(target, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'فشل تسجيل الدخول';
      if (msg.includes('Invalid login credentials')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (msg.includes('Email not confirmed')) {
        setError('يرجى تأكيد بريدك الإلكتروني أولاً');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('أدخل بريدك الإلكتروني أولاً');
      return;
    }
    setError('');
    setInfo('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setInfo('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك');
    } catch (err) {
      setError(err.message || 'فشل إرسال الرابط');
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="تسجيل الدخول"
      subtitle="مرحباً بك في سوق الوسيط"
      footer={
        <>
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-gold hover:underline font-medium">
            أنشئ حساباً جديداً
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}
        {info && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">
            {info}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              autoComplete="email"
              className="pr-10"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">كلمة المرور</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-gold hover:underline"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
              dir="ltr"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-navy text-white hover:bg-navy/90 h-11 text-base font-semibold"
        >
          {loading ? 'جارٍ الدخول...' : 'دخول'}
        </Button>
      </form>
    </AuthLayout>
  );
}