import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/public/Reveal";
import {
  ShieldCheck, Store, ShoppingBag, FileText, MessagesSquare, Star, ArrowLeft,
  Package, TrendingUp, Users, BadgeCheck, Search, ClipboardList, Truck, CheckCircle2,
} from "lucide-react";

const categories = [
  { icon: "🚬", name: "دخان وتبغ" },
  { icon: "🥫", name: "مواد غذائية" },
  { icon: "🥤", name: "مشروبات" },
  { icon: "🧴", name: "منظفات" },
  { icon: "🌾", name: "حبوب وأعلاف" },
  { icon: "🧀", name: "ألبان وأجبان" },
  { icon: "🧻", name: "ورقيات وتغليف" },
  { icon: "⚡", name: "كهربائيات" },
];

const features = [
  { icon: BadgeCheck, title: "تجار موثّقون", desc: "كل تاجر يمرّ بمراجعة السجل التجاري قبل التفعيل، لضمان سوق جاد وآمن." },
  { icon: FileText, title: "فواتير رسمية", desc: "توليد فواتير PDF تلقائياً مع رمز QR للتحقق، وحساب العمولات والصافي بدقة." },
  { icon: MessagesSquare, title: "محادثات مباشرة", desc: "تواصل بين التاجر والمشتري داخل المنصة مع دعم المرفقات والإشعارات." },
  { icon: ShieldCheck, title: "أمان وصلاحيات", desc: "أدوار منفصلة: مدير، تاجر، مشتري — كلٌّ يرى ما يخصّه فقط." },
];

const merchantSteps = [
  { icon: ClipboardList, title: "سجّل وارفع سجلك", desc: "أنشئ حساب تاجر وارفع السجل التجاري للمراجعة." },
  { icon: Package, title: "أضف منتجاتك", desc: "أدر المستودع والأسعار وحدد الحد الأدنى للطلب." },
  { icon: CheckCircle2, title: "استلم الطلبات", desc: "أكّد، جهّز، شحن، وأرسل الفاتورة تلقائياً للمشتري." },
];

const buyerSteps = [
  { icon: Search, title: "تصفّح وابحث", desc: "اكتشف المنتجات والتجار والأسعار بسهولة." },
  { icon: ShoppingBag, title: "أضف للسلة", desc: "اختر الكميات وحدد طريقة الدفع المناسبة." },
  { icon: Truck, title: "تابع التوصيل", desc: "استلم إشعارات الحالة وقيّم التاجر بعد التسليم." },
];

const testimonials = [
  { name: "أبو خالد", role: "تاجر مواد غذائية", text: "سوق الوسيط نقلة نوعية لعملي. الفواتير التلقائية والعمولات الواضحة وفّرت عليّ ساعات من العمل.", rating: 5 },
  { name: "محمد العلي", role: "صاحب محل بقالة", text: "أجد كل ما أحتاجه من تجار موثّقين بأسعار جملة عادلة، والمحادثة المباشرة تسهّل التفاوض.", rating: 5 },
  { name: "سامر الحسين", role: "موزّع مشروبات", text: "التصميم بسيط وواضح، وأبي وأبي يستخدمه بسهولة. نظام التقييمات يبني الثقة بيننا.", rating: 4 },
];

export default function Home() {
  const [stats, setStats] = useState({ merchants: 0, products: 0, invoices: 0, loaded: false });

  useEffect(() => {
    Promise.all([
      base44.entities.MerchantProfile.list(),
      base44.entities.Product.list(),
      base44.entities.Invoice.list(),
    ])
      .then(([m, p, i]) => setStats({ merchants: (m || []).length, products: (p || []).length, invoices: (i || []).length, loaded: true }))
      .catch(() => setStats({ merchants: 0, products: 0, invoices: 0, loaded: true }));
  }, []);

  return (
    <div>
      {/* البطل */}
      <section className="bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, hsl(var(--gold)) 0, transparent 45%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-sm font-medium mb-5">
              <ShieldCheck className="w-4 h-4" />
              منصة تجارة بين الشركات (B2B)
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              سوق الوسيط — حيث يلتقي التجار بالمشترين
            </h1>
            <p className="text-lg sm:text-xl text-white/75 mb-8 leading-relaxed">
              منصة عربية متكاملة تربط التجار أصحاب السجل التجاري الموثّق بالمشترين، مع إدارة كاملة للمنتجات والأسعار والفواتير والمحادثات في مكان واحد آمن ورسمي.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90 h-12 text-base px-7">
                <Link to="/register">ابدأ كتاجر</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 text-base px-7 border-white/30 text-white hover:bg-white/10">
                <Link to="/login">تصفّح كزائر <ArrowLeft className="w-4 h-4 mr-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* شريط الفئات */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Reveal className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">تصفّح حسب الفئة</h2>
          <p className="text-muted-foreground">أكثر فئات التجزئة والجملة طلباً في المنصة.</p>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.04}>
              <div className="bg-card rounded-2xl border border-border p-4 text-center hover:border-gold/50 hover:shadow-md transition-all cursor-pointer">
                <div className="text-3xl mb-2">{c.icon}</div>
                <p className="text-sm font-medium text-navy">{c.name}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* لماذا سوق الوسيط */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">لماذا سوق الوسيط؟</h2>
            <p className="text-muted-foreground">كل ما تحتاجه للتجارة بين الشركات في منصة واحدة رسمية وآمنة.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div className="bg-card rounded-2xl border border-border p-6 h-full hover:border-gold/50 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-navy text-gold flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-navy text-lg mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* كيف يعمل الموقع */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-3">كيف يعمل الموقع؟</h2>
          <p className="text-muted-foreground">ثلاث خطوات بسيطة لكل من التاجر والمشتري.</p>
        </Reveal>
        <div className="grid lg:grid-cols-2 gap-8">
          <Reveal>
            <div className="bg-card rounded-2xl border border-border p-6 h-full">
              <h3 className="font-bold text-navy text-lg mb-6 flex items-center gap-2"><Store className="w-5 h-5 text-gold" /> للتاجر</h3>
              <div className="space-y-5">
                {merchantSteps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-navy text-gold flex items-center justify-center relative">
                        <Icon className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{s.title}</p>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-card rounded-2xl border border-border p-6 h-full">
              <h3 className="font-bold text-navy text-lg mb-6 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-gold" /> للمشتري</h3>
              <div className="space-y-5">
                {buyerSteps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-navy text-gold flex items-center justify-center relative">
                        <Icon className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-navy text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{s.title}</p>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* إحصائيات حية */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 text-center">
            <Stat icon={Store} value={stats.loaded ? stats.merchants : null} label="تاجر موثّق" />
            <Stat icon={Package} value={stats.loaded ? stats.products : null} label="منتج معروض" />
            <Stat icon={FileText} value={stats.loaded ? stats.invoices : null} label="فاتورة صادرة" />
          </div>
        </div>
      </section>

      {/* شهادات */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Reveal className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-3">ماذا يقول تجارنا؟</h2>
          <p className="text-muted-foreground">آراء حقيقية من مستخدمي سوق الوسيط.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`w-4 h-4 ${s < t.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed flex-1">«{t.text}»</p>
                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                  <div className="w-11 h-11 rounded-full bg-navy text-gold flex items-center justify-center font-bold">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-navy">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* دعوة أخيرة */}
      <section className="bg-gradient-to-l from-navy to-[#14213d] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold mb-4">انضم إلى سوق الوسيط اليوم</h2>
            <p className="text-white/75 mb-8">سجّل كتاجر أو مشتري خلال دقائق وابدأ التجارة في بيئة رسمية وآمنة.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90 h-12 text-base px-7"><Link to="/register">إنشاء حساب</Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 text-base px-7 border-white/30 text-white hover:bg-white/10"><Link to="/login">تسجيل الدخول</Link></Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div>
      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-gold" />
      </div>
      <p className="text-4xl font-extrabold mb-1">{value === null ? "—" : value.toLocaleString("ar-EG")}</p>
      <p className="text-white/60 text-sm">{label}</p>
    </div>
  );
}