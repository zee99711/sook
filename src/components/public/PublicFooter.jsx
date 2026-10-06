import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <span className="text-navy font-extrabold text-lg">و</span>
            </div>
            <span className="font-bold text-lg text-white">سوق الوسيط</span>
          </div>
          <p className="text-sm leading-relaxed">
            منصة عربية متكاملة للتجارة بين الشركات، تربط التجار الموثّقين بالمشترين في بيئة آمنة ورسمية.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-gold transition">الرئيسية</Link></li>
            <li><Link to="/about" className="hover:text-gold transition">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition">تواصل معنا</Link></li>
            <li><Link to="/faq" className="hover:text-gold transition">الأسئلة الشائعة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">قانوني</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-gold transition">الشروط والأحكام</Link></li>
            <li><Link to="/privacy" className="hover:text-gold transition">سياسة الخصوصية</Link></li>
            <li className="flex items-center gap-2 pt-1"><ShieldCheck className="w-4 h-4 text-gold" /> تجار موثّقون</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> info@wasit.market</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +963 11 000 0000</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> دمشق، سوريا</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center text-sm">
          © {year} سوق الوسيط — جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}