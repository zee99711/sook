import React from "react";
import Reveal from "@/components/public/Reveal";
import { Target, Eye, Handshake, ShieldCheck, Users, TrendingUp } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "الثقة والمصداقية", desc: "نتحقق من كل تاجر قبل تفعيله لضمان سوق جاد خالٍ من الاحتيال." },
  { icon: Handshake, title: "الشفافية", desc: "عمولات واضحة، فواتير رسمية، وتقييمات حقيقية بين الأطراف." },
  { icon: Users, title: "خدمة الإنسان", desc: "واجهة بسيطة تناسب الجميع، بخطوط كبيرة وتصميم يراعي كبار السن." },
  { icon: TrendingUp, title: "النمو المستدام", desc: "نساعد التجار والمشترين على النمو عبر أدوات تجارة احترافية." },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <Reveal className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-4">من نحن</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          سوق الوسيط منصة عربية متكاملة للتجارة بين الشركات (B2B)، وُلدت لربط التجار الموثّقين بالمشترين في بيئة رقمية رسمية وآمنة.
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 gap-6 mb-14">
        <Reveal>
          <div className="bg-card rounded-2xl border border-border p-6 h-full">
            <div className="w-12 h-12 rounded-xl bg-navy text-gold flex items-center justify-center mb-4"><Target className="w-6 h-6" /></div>
            <h2 className="font-bold text-navy text-xl mb-2">رسالتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              تسهيل التجارة بالجملة في المنطقة العربية عبر منصة موحّدة تضمن الثقة، وتبسّط إدارة المنتجات والفواتير والتواصل بين الأطراف.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="bg-card rounded-2xl border border-border p-6 h-full">
            <div className="w-12 h-12 rounded-xl bg-navy text-gold flex items-center justify-center mb-4"><Eye className="w-6 h-6" /></div>
            <h2 className="font-bold text-navy text-xl mb-2">رؤيتنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              أن نكون السوق الرقمي الأول للتجار والمشترين في المنطقة، بتجربة بسيطة ورسمية تناسب جميع الأعمار.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-navy">قيمنا</h2>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((v, i) => {
          const Icon = v.icon;
          return (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="bg-card rounded-2xl border border-border p-6 text-center h-full hover:shadow-md transition">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/15 text-gold flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-navy mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}