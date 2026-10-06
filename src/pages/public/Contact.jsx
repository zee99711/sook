import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Reveal from "@/components/public/Reveal";
import { Mail, Phone, MapPin, Send, Loader2, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "يرجى تعبئة الاسم والبريد والرسالة", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await base44.entities.ContactMessage.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        status: "new",
      });
      toast({ title: "تم إرسال رسالتك بنجاح", description: "سنتواصل معك في أقرب وقت." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast({ title: err.message || "فشل الإرسال", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <Reveal className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-4">تواصل معنا</h1>
        <p className="text-muted-foreground text-lg">نحن هنا للإجابة على استفساراتك. أرسل لنا وسنردّ في أقرب وقت.</p>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-8">
        <Reveal>
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 h-full">
            <h2 className="font-bold text-navy text-xl mb-6">أرسل رسالة</h2>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم الكامل *</Label>
                  <Input value={form.name} onChange={set("name")} className="h-11" placeholder="اسمك" />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني *</Label>
                  <Input type="email" value={form.email} onChange={set("email")} className="h-11" placeholder="email@example.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input value={form.phone} onChange={set("phone")} className="h-11" placeholder="+963 ..." />
                </div>
                <div className="space-y-2">
                  <Label>الموضوع</Label>
                  <Input value={form.subject} onChange={set("subject")} className="h-11" placeholder="موضوع الرسالة" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الرسالة *</Label>
                <Textarea value={form.message} onChange={set("message")} rows={5} placeholder="اكتب رسالتك هنا..." />
              </div>
              <Button type="submit" disabled={sending} className="w-full h-12 bg-gold text-navy hover:bg-gold/90 text-base">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الإرسال...</> : <><Send className="w-4 h-4" /> إرسال</>}
              </Button>
            </form>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h2 className="font-bold text-navy text-xl mb-6">معلومات التواصل</h2>
              <div className="space-y-4">
                <InfoRow icon={Mail} label="البريد الإلكتروني" value="info@wasit.market" />
                <InfoRow icon={Phone} label="الهاتف" value="+963 11 000 0000" />
                <InfoRow icon={MapPin} label="العنوان" value="دمشق، الجمهورية العربية السورية" />
                <InfoRow icon={Clock} label="ساعات العمل" value="السبت - الخميس، 9 صباحاً - 5 مساءً" />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border">
              <iframe
                title="موقعنا"
                src="https://www.openstreetmap.org/export/embed.html?bbox=36.20%2C33.45%2C36.45%2C33.55&layer=mapnik&marker=33.50%2C36.30"
                className="w-full h-72 border-0"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold text-navy">{value}</p>
      </div>
    </div>
  );
}