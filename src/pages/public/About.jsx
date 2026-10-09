// src/pages/public/About.jsx
import React from 'react';
import { Target, Users, Shield, TrendingUp, Heart, Award } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Target,
      title: 'رؤيتنا',
      desc: 'أن نكون المنصة الرائدة في التجارة B2B في العالم العربي، ونسهل على التجار الوصول لأسواق جديدة.',
    },
    {
      icon: Users,
      title: 'فريقنا',
      desc: 'نحن فريق من التجار والمطورين نجمع بين خبرة السوق العميقة والتقنية الحديثة.',
    },
    {
      icon: Shield,
      title: 'ثقتنا',
      desc: 'نتحقق يدوياً من كل سجل تجاري لضمان بيئة آمنة وموثوقة لكل الأطراف.',
    },
    {
      icon: TrendingUp,
      title: 'نمو مستمر',
      desc: 'نعمل باستمرار على إضافة ميزات جديدة تلبي احتياجات التجار والمشترين.',
    },
    {
      icon: Heart,
      title: 'العميل أولاً',
      desc: 'كل قرار نتخذه يهدف لخدمة تجارنا ومشترينا، وليس فقط زيادة الأرباح.',
    },
    {
      icon: Award,
      title: 'الجودة',
      desc: 'نلتزم بأعلى معايير الجودة في كل تفصيل، من التصميم إلى خدمة العملاء.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">من نحن</h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            سوق الوسيط هي منصة عربية متكاملة للتجارة بين الشركات (B2B)،
            تربط التجار الموثّقين بالمشترين في بيئة آمنة وموثوقة.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-12 mb-12">
          <h2 className="text-2xl font-bold text-navy mb-4">قصتنا</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              بدأت فكرة سوق الوسيط من مشكلة حقيقية واجهناها في عالم التجارة بالجملة:
              صعوبة العثور على مزودين موثوقين، وعدم وجود منصة تجمع التجار والمشترين
              في مكان واحد بأمان وشفافية.
            </p>
            <p>
              لاحظنا أن التجار يعتمدون على العلاقات الشخصية والاتصالات المباشرة فقط،
              مما يحد من نموهم ويصعّب عليهم الوصول لعملاء جدد. بينما يعاني المشترون
              من صعوبة المقارنة بين الأسعار والتحقق من مصداقية البائعين.
            </p>
            <p>
              لذلك قررنا بناء منصة تحل هذه المشاكل من جذورها، من خلال التحقق اليدوي
              من السجلات التجارية، توفير أدوات إدارة متقدمة، وضمان بيئة تجارية آمنة
              للجميع.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-navy mb-6 text-center">قيمنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-navy mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}