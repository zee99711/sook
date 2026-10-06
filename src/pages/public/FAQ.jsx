import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Reveal from "@/components/public/Reveal";

const groups = [
  {
    title: "التسجيل والحسابات",
    items: [
      { q: "كيف أنشئ حساب تاجر؟", a: "اضغط «إنشاء حساب»، اختر «تاجر»، أدخل بياناتك وارفع صورة السجل التجاري. يتم مراجعة طلبك من الإدارة خلال وقت قصير، وستصلك إشعار بالموافقة أو الرفض." },
      { q: "هل أحتاج إلى سجل تجاري؟", a: "نعم، السجل التجاري الساري شرط أساسي لتسجيل التاجر لضمان سوق جاد. أما المشتري فلا يحتاجه." },
      { q: "هل يمكنني تغيير نوع الحساب لاحقاً؟", a: "لتغيير نوع الحساب (من مشتري إلى تاجر مثلاً) تواصل مع الإدارة عبر صفحة «تواصل معنا»." },
    ],
  },
  {
    title: "العمليات والفواتير",
    items: [
      { q: "كيف تُحسب العمولة؟", a: "تُحتسب العمولة كنسبة من قيمة الطلب حسب طريقة الدفع المختارة، وتُخصم تلقائياً من مستحقات التاجر. يمكنك الاطلاع على النسب من سلة الطلب أو من إعدادات الأدمن." },
      { q: "هل أستلم فاتورة رسمية؟", a: "نعم، تولّد المنصة فاتورة PDF تلقائياً مع رقم فاتورة ورمز QR للتحقق، وترسلها للتاجر والمشتري." },
      { q: "ما طرق الدفع المتاحة؟", a: "الدفع عند التسليم، محفظة USDT، شام كاش، وسيريتل كاش. قد تختلف العمولة حسب الطريقة." },
    ],
  },
  {
    title: "المنتجات والتواصل",
    items: [
      { q: "هل يمكن للزائر تصفّح المنتجات؟", a: "التصفّح متاح بعد إنشاء حساب مجاني، أما الشراء فيتطلب حساب مشتري مفعّل." },
      { q: "كيف أتواصل مع التاجر؟", a: "من صفحة المنتج أو من قائمة التجار، اضغط «مراسلة» لفتح محادثة مباشرة مع دعم المرفقات والإشعارات." },
      { q: "كيف أقيّم التاجر؟", a: "بعد إتمام الطلب وتسليمه، يظهر زر «قيّم» في صفحة طلباتك لإرسال تقييم من نجمة إلى خمس مع تعليق." },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <Reveal className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3">الأسئلة الشائعة</h1>
        <p className="text-muted-foreground text-lg">إجابات لأكثر الأسئلة شيوعاً حول سوق الوسيط.</p>
      </Reveal>

      <div className="space-y-10">
        {groups.map((g, gi) => (
          <Reveal key={g.title} delay={gi * 0.05}>
            <h2 className="font-bold text-navy text-xl mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gold text-navy flex items-center justify-center text-sm font-bold">{gi + 1}</span>
              {g.title}
            </h2>
            <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border px-4">
              {g.items.map((it, i) => (
                <AccordionItem key={i} value={`${gi}-${i}`} className="border-b border-border last:border-0">
                  <AccordionTrigger className="text-right font-semibold text-navy text-base hover:no-underline py-5">{it.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        ))}
      </div>
    </div>
  );
}