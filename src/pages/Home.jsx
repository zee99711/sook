// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Shield,
  FileText,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getEffectiveRole, roleDashboardPath } from '@/lib/roles';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const dashboardPath = isAuthenticated
    ? roleDashboardPath(getEffectiveRole(user))
    : '/register';

  const features = [
    {
      icon: Store,
      title: 'تجار موثّقون',
      desc: 'نتحقق يدوياً من كل سجل تجاري لضمان بيئة آمنة وموثوقة.',
    },
    {
      icon: FileText,
      title: 'فواتير إلكترونية',
      desc: 'توليد فوري للفواتير بصيغة PDF مع رمز QR للتحقق.',
    },
    {
      icon: MessageSquare,
      title: 'محادثات مباشرة',
      desc: 'تواصل فوري بين التاجر والمشتري داخل المنصة.',
    },
    {
      icon: TrendingUp,
      title: 'تقارير متقدمة',
      desc: 'إحصائيات شاملة للمبيعات والمخزون والأداء.',
    },
    {
      icon: Shield,
      title: 'دفع آمن',
      desc: 'طرق دفع متعددة: USDT، شام كاش، سيريتل كاش، والدفع عند التسليم.',
    },
    {
      icon: ShoppingBag,
      title: 'تصفّح ذكي',
      desc: 'فلترة متقدمة بالبحث والفئة والمنطقة والسعر.',
    },
  ];

  const steps = [
    { num: 1, title: 'أنشئ حسابك', desc: 'سجل كتاجر أو مشتري في دقيقة' },
    { num: 2, title: 'وثّق سجلك', desc: 'ارفع سجلك التجاري للتجار' },
    { num: 3, title: 'تصفّح أو اعرض', desc: 'ابحث عن منتجات أو اعرض بضائعك' },
    { num: 4, title: 'أتمم الصفقة', desc: 'دفع آمن وتوصيل مضمون' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-[#0f1a30] text-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
            <span className="text-sm text-gold font-medium">
              منصة B2B العربية الأولى
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            سوق الوسيط
            <br />
            <span className="text-gold">حيث تلتقي التجارة بالثقة</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة عربية متكاملة تربط التجار الموثّقين بالمشترين، مع إدارة كاملة
            للمنتجات والفواتير والمحادثات في بيئة آمنة ورسمية.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-navy rounded-xl font-bold text-lg hover:bg-gold/90 transition-colors"
            >
              {isAuthenticated ? 'لوحة التحكم' : 'ابدأ الآن'}
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
            >
              تعرف علينا
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-14">
            <div>
              <p className="text-3xl font-bold text-gold">+100</p>
              <p className="text-sm text-white/70">تاجر مسجل</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold">+1000</p>
              <p className="text-sm text-white/70">منتج متاح</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gold">+500</p>
              <p className="text-sm text-white/70">صفقة ناجحة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
            لماذا سوق الوسيط؟
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            نجمع لك أفضل الميزات في منصة واحدة لتسهيل تجارتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-gold/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-navy mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
              كيف يعمل الموقع؟
            </h2>
            <p className="text-muted-foreground">
              4 خطوات بسيطة للبدء
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gold text-navy flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg">
                  {s.num}
                </div>
                <h3 className="font-bold text-navy mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>

                {i < steps.length - 1 && (
                  <ArrowLeft className="hidden lg:block absolute top-8 -left-3 w-6 h-6 text-gold" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For merchants / buyers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Merchants */}
          <div className="bg-navy text-white rounded-3xl p-8 md:p-10">
            <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center mb-5">
              <Store className="w-7 h-7 text-navy" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              أنت تاجر؟
            </h2>
            <p className="text-white/80 mb-6 leading-relaxed">
              اعرض بضائعك لآلاف المشترين، وتوسّع في تجارتك مع أدوات إدارة متقدمة.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'نشر غير محدود للمنتجات',
                'إدارة كاملة للمستودع والأسعار',
                'تقارير مبيعات تفصيلية',
                'استقبال الطلبات وإدارتها',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy rounded-xl font-bold hover:bg-gold/90 transition-colors"
            >
              سجّل كتاجر
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Buyers */}
          <div className="bg-card border-2 border-gold/30 rounded-3xl p-8 md:p-10">
            <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mb-5">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
              أنت مشتري؟
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              تصفّح آلاف المنتجات من تجار موثّقين، واشترِ بأسعار الجملة بكل سهولة.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'تصفّح بدون تسجيل',
                'مقارنة الأسعار بين التجار',
                'طرق دفع متعددة وآمنة',
                'تقييم التجار وقراءة المراجعات',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-navy">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-colors"
            >
              سجّل كمشتري
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-gradient-to-br from-gold to-yellow-500 rounded-3xl p-10 md:p-14 text-center text-navy">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            جاهز تبدأ تجارتك؟
          </h2>
          <p className="text-navy/80 mb-8 max-w-2xl mx-auto text-lg">
            انضم لمئات التجار والمشترين الذين يثقون بسوق الوسيط يومياً
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-navy text-white rounded-xl font-bold text-lg hover:bg-navy/90 transition-colors"
          >
            إنشاء حساب مجاناً
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}