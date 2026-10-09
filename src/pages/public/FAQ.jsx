// src/pages/public/FAQ.jsx
import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'ما هو سوق الوسيط؟',
    a: 'سوق الوسيط هو منصة تجارية B2B عربية تربط بين التجار الذين لديهم سجلات تجارية موثقة والمشترين من أصحاب المتاجر الصغيرة أو التجار الآخرين. نوفر بيئة آمنة للتبادل التجاري مع إدارة كاملة للمنتجات والفواتير والمحادثات.',
  },
  {
    q: 'كيف أسجل كتاجر؟',
    a: 'اضغط على "إنشاء حساب"، اختر "تاجر"، وأدخل بياناتك. بعد التسجيل، ارفع صورة السجل التجاري من صفحة "الملف والإعدادات". سيقوم فريقنا بمراجعة طلبك خلال 24-48 ساعة.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'نوفر عدة طرق دفع: الدفع عند التسليم، محفظة USDT، شام كاش، وسيريتل كاش. لكل طريقة عمولة مختلفة تظهر بشكل واضح عند إتمام الطلب.',
  },
  {
    q: 'كيف يتم حساب العمولات؟',
    a: 'العمولات تُحسب على المشتري عند الدفع، وتختلف حسب طريقة الدفع المختارة. التاجر يستلم صافي المبلغ بعد خصم العمولة عند التسليم. النسب قابلة للتعديل من قبل الإدارة.',
  },
  {
    q: 'هل يمكنني إلغاء طلب؟',
    a: 'نعم، يمكنك إلغاء الطلب قبل أن يؤكده التاجر. بعد التأكيد، لا يمكن الإلغاء إلا بموافقة التاجر. تواصل معنا إذا واجهت مشكلة.',
  },
  {
    q: 'كيف أتواصل مع تاجر معين؟',
    a: 'من صفحة تفاصيل المنتج أو صفحة التاجر، اضغط على زر "المحادثة" أو اذهب مباشرة لصفحة "المحادثات" لبدء محادثة فورية.',
  },
  {
    q: 'كيف يتم التحقق من السجلات التجارية؟',
    a: 'يقوم فريق الإدارة بمراجعة كل سجل تجاري يدوياً خلال 24-48 ساعة. يتم التحقق من صحة المستند ومطابقته للبيانات المسجلة.',
  },
  {
    q: 'هل بياناتي آمنة؟',
    a: 'نعم، نستخدم أحدث تقنيات التشفير (SSL/TLS) وقواعد بيانات آمنة مع سياسات RLS. لا نشارك بياناتك مع أي طرف ثالث إلا لأغراض الفاتورة أو بموجب القانون.',
  },
  {
    q: 'هل هناك اشتراك شهري؟',
    a: 'حالياً المنصة مجانية بالكامل للتسجيل. قد نضيف خطط اشتراك متقدمة في المستقبل بميزات إضافية، وسنعلمك مسبقاً.',
  },
  {
    q: 'كيف أبلّغ عن مشكلة أو تاجر مخالف؟',
    a: 'يمكنك التواصل معنا عبر صفحة "اتصل بنا" أو مراسلتنا مباشرة. سيتعامل فريقنا مع أي شكوى بجدية وسرعة.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold mb-4">
            <HelpCircle className="w-7 h-7 text-navy" />
          </div>
          <h1 className="text-4xl font-bold mb-3">الأسئلة الشائعة</h1>
          <p className="text-white/80">إجابات على أكثر الأسئلة تكراراً</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-secondary/30 transition-colors"
              >
                <span className="font-semibold text-navy flex-1">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-3 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border">
                  <div className="pt-4">{item.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gold/10 border border-gold/30 rounded-2xl p-6 text-center">
          <p className="text-navy font-medium mb-1">لم تجد إجابة سؤالك؟</p>
          <p className="text-sm text-muted-foreground mb-4">
            فريقنا جاهز لمساعدتك
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy/90 text-sm font-medium"
          >
            تواصل معنا
          </a>
        </div>
      </section>
    </div>
  );
}