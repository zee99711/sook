// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Building2, Store } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleDashboardPath } from '@/lib/roles';

const REGIONS = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة'
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    account_type: 'buyer',
    business_name: '',
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // تحقق
    if (!form.full_name.trim()) return setError('الاسم الكامل مطلوب');
    if (!form.email.trim()) return setError('البريد الإلكتروني مطلوب');
    if (form.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (form.password !== form.passwordConfirm) return setError('كلمتا المرور غير متطابقتين');
    if (form.account_type === 'merchant' && !form.business_name.trim()) {
      return setError('اسم النشاط التجاري مطلوب للتجار');
    }

    setLoading(true);

    try {
      // إنشاء المستخدم في Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.full_name.trim(),
            display_name: form.full_name.trim(),
            phone: form.phone.trim(),
            account_type: form.account_type,
            business_name: form.business_name.trim(),
            region: form.region,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('فشل إنشاء الحساب');
      }

      // إذا كان Supabase يتطلب تأكيد البريد
      if (data.user && !data.session) {
        setSuccess(
          '✅ تم إنشاء حسابك! يرجى تأكيد بريدك الإلكتروني من الرابط المُرسل إليك.'
        );
        setLoading(false);
        return;
      }

      // إذا كان تسجيل الدخول تلقائياً (بدون تأكيد بريد)
      const target = roleDashboardPath(form.account_type);
      navigate(target, { replace: true });
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.message || 'فشل إنشاء الحساب';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('هذا البريد الإلكتروني مسجل مسبقاً');
      } else if (msg.includes('Password should be')) {
        setError('كلمة المرور ضعيفة جداً');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout      icon={UserPlus}
      title="إنشاء حساب جديد"
      subtitle="انضم إلى سوق الوسيط"
      footer={
        <>
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">
            سجل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        {/* نوع الحساب */}
        <div className="space-y-2">
          <Label>نوع الحساب</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update('account_type', 'buyer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                form.account_type === 'buyer'
                  ? 'border-gold bg-gold/10 text-navy'
                  : 'border-border hover:border-gold/50'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="font-semibold text-sm">مشتري</span>
              <span className="text-xs text-muted-foreground">تصفح واشترِ</span>
            </button>
            <button
              type="button"
              onClick={() => update('account_type', 'merchant')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                form.account_type === 'merchant'
                  ? 'border-gold bg-gold/10 text-navy'
                  : 'border-border hover:border-gold/50'
              }`}
            >
              <Store className="w-6 h-6" />
              <span className="font-semibold text-sm">تاجر</span>
              <span className="text-xs text-muted-foreground">بِع بالجملة</span>
            </button>
          </div>
        </div>

        {/* الاسم الكامل */}
        <div className="space-y-2">
          <Label htmlFor="full_name">الاسم الكامل *</Label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              placeholder="أدخل اسمك الكامل"
              required
              className="pr-10"
            />
          </div>
        </div>

        {/* البريد */}
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني *</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="example@email.com"
              required
              dir="ltr"
              className="pr-10"
            />
          </div>
        </div>

        {/* الجوال */}
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الجوال</Label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+963 9XX XXX XXX"
              dir="ltr"
              className="pr-10"
            />
          </div>
        </div>

        {/* المنطقة */}
        <div className="space-y-2">
          <Label htmlFor="region">المنطقة</Label>
          <select
            id="region"
            value={form.region}
            onChange={(e) => update('region', e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">اختر المنطقة</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* اسم النشاط التجاري - للتجار فقط */}
        {form.account_type === 'merchant' && (
          <div className="space-y-2">
            <Label htmlFor="business_name">اسم النشاط التجاري *</Label>
            <div className="relative">
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) => update('business_name', e.target.value)}
                placeholder="مثال: مؤسسة النور للتجارة"
                className="pr-10"
              />
            </div>
          </div>
        )}

        {/* كلمة المرور */}
        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور *</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="6 أحرف على الأقل"
              required
              dir="ltr"
              className="pr-10"
            />
          </div>
        </div>

        {/* تأكيد كلمة المرور */}
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">تأكيد كلمة المرور *</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              required
              dir="ltr"
              className="pr-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-navy text-white hover:bg-navy/90 h-11 text-base font-semibold"
        >
          {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
        </Button>

        {form.account_type === 'merchant' && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ⓘ سيتم مراجعة حسابك من قبل الإدارة والتحقق من سجلك التجاري قبل تفعيل ميزات النشر
          </p>
        )}
      </form>
    </AuthLayout>
  );
}