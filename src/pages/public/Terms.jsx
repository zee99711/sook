// src/pages/public/Terms.jsx
import React from 'react';
import { FileText } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      title: '1. قبول الشروط',
      body: 'باستخدامك لمنصة سوق الوسيط، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام المنصة.',
    },
    {
      title: '2. طبيعة الخدمة',
      body: 'سوق الوسيط هي منصة وسيطة تربط بين التجار والمشترين. نحن لا نتحمل مسؤولية جودة المنتجات أو صحة المعلومات المُعلنة من التجار، لكننا نتحقق من السجلات التجارية لضمان مصداقية التسجيل.',
    },
    {
      title: '3. التسجيل والحسابات',
      body: 'يجب أن تكون معلومات التسجيل دقيقة وكاملة. أنت مسؤول عن الحفاظ على سرية بيانات حسابك. يُمنع إنشاء حسابات وهمية أو استخدام معلومات غير صحيحة.',
    },
    {
      title: '4. الالتزامات المالية',
      body: 'يلتزم التاجر بدفع الاشتراكات المتفق عليها (إن وُجدت) وعمولات طرق الدفع. يلتزم المشتري بدفع قيمة الفواتير المؤكدة عبر طرق الدفع المتاحة.',
    },
    {
      title: '5. المحتوى والمنتجات',
      body: 'يلتزم التاجر بعرض منتجات حقيقية ومطابقة للمواصفات المعلنة. يُمنع نشر منتجات محظورة قانونياً أو مخالفة للأنظمة المحلية.',
    },
    {
      title: '6. سياسة الفواتير والإلغاء',
      body: 'يمكن للمشتري إلغاء الطلب قبل تأكيد التاجر. بعد التأكيد، لا يمكن الإلغاء إلا بموافقة التاجر. تُصدر الفواتير إلكترونياً وتُحفظ في حساب الطرفين.',
    },
    {
      title: '7. الخصوصية',
      body: 'نحترم خصوصيتك ونلتزم بحماية بياناتك. لا نشارك معلوماتك مع أطراف ثالثة إلا بما يتوافق مع سياسة الخصوصية المنفصلة.',
    },
    {
      title: '8. حد المسؤولية',
      body: 'لا يتحمل سوق الوسيط مسؤولية أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو التعامل مع أطراف أخرى.',
    },
    {
      title: '9. تعديل الشروط',
      body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخلي.',
    },
    {
      title: '10. القانون الواجب التطبيق',
      body: 'تخضع هذه الشروط وتُفسَّر وفقاً للقوانين السارية في البلد الذي تعمل فيه المنصة.',
    },
  ];

  return (
    <div>
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold mb-4">
            <FileText className="w-7 h-7 text-navy" />
          </div>
          <h1 className="text-4xl font-bold mb-3">الشروط والأحكام</h1>
          <p className="text-white/80">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-10 space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-navy mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}