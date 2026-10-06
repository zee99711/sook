import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Store, ShoppingBag, FileText, MessagesSquare, Star, ArrowLeft } from "lucide-react";
import { getEffectiveRole, roleDashboardPath } from "@/lib/roles";

const features = [
  { icon: Store, title: "حسابات التجار", desc: "تسجيل موثّق برفع السجل التجاري ومراجعة يدوية من الإدارة." },
  { icon: ShoppingBag, title: "تصفّح وشراء", desc: "يزور الزائر المنتجات والأسعار بحرّية، والشراء يتطلب حساباً." },
  { icon: FileText, title: "الفواتير والطلبات", desc: "إدارة كاملة للفواتير وحالة التوصيل والدف� لكل طرف." },
  { icon: MessagesSquare, title: "محادثات مباشرة", desc: "تواصل بين التاجر والمشتري داخل المنصة بمرفقات آمنة." },
  { icon: Star, title: "تقييمات موثوقة", desc: "نظام تقييم للتجار يبني الثقة في السوق." },
  { icon: ShieldCheck, title: "أمان وصلاحيات", desc: "أدوار منفصلة: مدير، تاجر، مشتري — كلٌّ يرى ما يخصّه." },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const role = getEffectiveRole(user);
  const dashboard = role ? roleDashboardPath(role) : "/login";

  return (
    <div className="min-h-screen bg-background">
      {/* شريط علوي */}
      <header className="sticky top-0 z-30 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <span className="text-navy font-extrabold text-lg">و</span>
            </div>
            <span className="font-bold text-lg">سوق الوسيط</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <Button asChild className="bg-gold text-navy hover:bg-gold/90 h-10">
                <Link to={dashboard}>لوحتي</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-white hover:bg-white/10 h-10">
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild className="bg-gold text-navy hover:bg-gold/90 h-10">
                  <Link to="/register">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* البطل */}
      <section className="bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(var(--gold)) 0, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold text-sm font-medium mb-5">
              <ShieldCheck className="w-4 h-4" />
              منصة تجارة بين الشركات (B2B)
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              سوق الوسيط — حيث يلتقي التجار بالمشترين
            </h1>
            <p className="text-lg text-white/75 mb-8 leading-relaxed">
              منصة عربية متكاملة تربط التجار أصحاب السجل التجاري الموثّق بالمشترين،
              مع إدارة للمنتجات والأسعار والفواتير والمحادثات في مكان واحد آمن.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90 h-12 text-base">
                <Link to="/register">ابدأ الآن</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 text-base border-white/30 text-white hover:bg-white/10">
                <Link to="/login">
                  تسجيل الدخول
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* المزايا */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-3">لماذا سوق الوسيط؟</h2>
          <p className="text-muted-foreground">كل ما تحتاجه للتجارة بين الشركات في منصة واحدة رسمية وآمنة.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-card rounded-2xl border border-border p-6 hover:border-gold/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* دعوة أخيرة */}
      <section className="bg-secondary/60 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">انضم إلى سوق الوسيط اليوم</h2>
          <p className="text-muted-foreground mb-8">سجّل كتاجر أو مشتري خلال دقائق وابدأ التجارة.</p>
          <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90 h-12 text-base">
            <Link to="/register">إنشاء حساب</Link>
          </Button>
        </div>
      </section>

      <footer className="bg-navy text-white/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm">
          © {new Date().getFullYear()} سوق الوسيط — جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}