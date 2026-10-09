// src/pages/public/Privacy.jsx
import React from 'react';
import { Shield } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      title: '1. المعلومات التي نجمعها',
      body: 'نجمع معلومات الحساب (الاسم، البريد الإلكتروني، رقم الجوال)، بيانات السجل التجاري للتجار، معلومات الفواتير والطلبات، وبيانات الاستخدام (الصفحات المزارة، الوقت).',
    },
    {
      title: '2. كيف نستخدم معلوماتك',
      body: 'نستخدم معلوماتك لتشغيل المنصة، التحقق من هوية التجار، إرسال الإشعارات المهمة، تحسين تجربة الاستخدام، والامتثال للالتزامات القانونية.',
    },
    {
      title: '3. مشاركة المعلومات',
      body: 'لا نشارك معلوماتك مع أطراف ثالثة إلا في حالات محدودة: مع الطرف الآخر في الفاتورة (المشتري يرى بيانات التاجر والعكس)، أو إذا طُلب قانونياً من جهة قضائية مختصة.',
    },
    {
      title: '4. حماية البيانات',
      body: 'نستخدم تشفير SSL/TLS لكل الاتصالات، وتشفير كلمات المرور، وتطبيق سياسات RLS على قاعدة البيانات لضمان عدم الوصول غير المصرح به.',
    },
    {
      title: '5. الاحتفاظ بالبيانات',
      body: 'نحتفظ ببياناتك طالما حسابك نشط. عند حذف الحساب، نحذف البيانات الشخصية خلال 30 يوماً، مع الاحتفاظ ببعض السجلات المالية للامتثال القانوني.',
    },
    {
      title: '6. الكوكيز',
      body: 'نستخدم الكوكيز لتذكر جلستك وتفضيلاتك. يمكنك تعطيلها من إعدادات متصفحك، لكن بعض ميزات المنصة قد لا تعمل.',
    },
    {
      title: '7. حقوقك',
      body: 'لك الحق في الوصول لبياناتك، تصحيحها، حذفها، أو تصديرها. كما يمكنك الاعتراض على معالجة بياناتك لأغراض تسويقية.',
    },
    {
      title: '8. الأطفال',
      body: 'المنصة غير موجهة للأطفال دون 18 عاماً. لا نجمع بيانات من قاصرين بشكل متعمد.',
    },
    {
      title: '9. التغييرات على السياسة',
      body: 'قد نحدّث سياسة الخصوصية من وقت لآخر. سنُعلمك بأي تغييرات جوهرية قبل تطبيقها.',
    },
    {
      title: '10. تواصل معنا',
      body: 'لأي استفسار حول الخصوصية، يرجى التواصل عبر صفحة "اتصل بنا" أو البريد الإلكتروني الرسمي.',
    },
  ];

  return (
    <div>
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold mb-4">
            <Shield className="w-7 h-7 text-navy" />
          </div>
          <h1 className="text-4xl font-bold mb-3">سياسة الخصوصية</h1>
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