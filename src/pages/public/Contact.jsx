// src/pages/public/Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSending(true);
    try {
      // نحاول نحفظ الرسالة في audit_logs كمثال
      await supabase.from('audit_logs').insert({
        action: 'contact_message',
        target: form.email,
        details: `الموضوع: ${form.subject}\nالرسالة: ${form.message}\nالجوال: ${form.phone}`,
        actor_name: form.name,
      });
      toast.success('تم إرسال رسالتك — سنتواصل معك قريباً');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error('فشل الإرسال — حاول مجدداً');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold mb-3">اتصل بنا</h1>
          <p className="text-white/80 text-lg">
            نحن هنا للإجابة على استفساراتك ومساعدتك
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy mb-1">البريد الإلكتروني</h3>
              <p className="text-sm text-muted-foreground" dir="ltr">
                support@wasit.market
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy mb-1">الهاتف</h3>
              <p className="text-sm text-muted-foreground" dir="ltr">
                +963 999 000 000
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy mb-1">العنوان</h3>
              <p className="text-sm text-muted-foreground">دمشق، سوريا</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-gold" />
                <h2 className="text-xl font-bold text-navy">أرسل رسالة</h2>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم الكامل *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="اسمك"
                      required
                    />
                  </div>
                  <div>
                    <Label>البريد الإلكتروني *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="example@email.com"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>رقم الجوال</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+963..."
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>الموضوع</Label>
                    <Input
                      value={form.subject}
                      onChange={(e) => update('subject', e.target.value)}
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                </div>

                <div>
                  <Label>الرسالة *</Label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={5}
                    className="w-full rounded-md border border-input bg-background p-3 text-sm"
                    placeholder="اكتب رسالتك بالتفصيل..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-navy text-white hover:bg-navy/90 h-11"
                >
                  <Send className="w-4 h-4 ml-2" />
                  {sending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}