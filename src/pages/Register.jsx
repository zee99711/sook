import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Store, ShoppingBag, Building2, Phone, Upload, FileText } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { roleDashboardPath } from "@/lib/roles";

export default function Register() {
  const [step, setStep] = useState("role"); // role | details | otp
  const [accountType, setAccountType] = useState("buyer"); // merchant | buyer
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [region, setRegion] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const isMerchant = accountType === "merchant";

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (isMerchant && !licenseFile) {
      setError("يرجى رفع صورة السجل التجاري");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "فشل التسجيل");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      // حفظ بيانات الدور المخصص
      const me = await base44.auth.me();
      await base44.auth.updateMe({
        account_type: accountType,
        display_name: displayName,
        phone,
        status: isMerchant ? "pending_review" : "active",
      });

      if (isMerchant) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: licenseFile });
        await base44.entities.MerchantProfile.create({
          user_id: me.id,
          business_name: businessName,
          region,
          commercial_license_file: file_uri,
          license_verified: false,
          subscription_plan: "free",
          rating_avg: 0,
        });
      } else {
        await base44.entities.BuyerProfile.create({
          user_id: me.id,
          buyer_type: "general",
        });
      }

      window.location.href = roleDashboardPath(accountType);
    } catch (err) {
      setError(err.message || "رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "تم إرسال الرمز", description: "تحقق من بريدك الإلكتروني للرمز الجديد." });
    } catch (err) {
      setError(err.message || "تعذّر إعادة إرسال الرمز");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  // ----- خطوة اختيار الدور -----
  if (step === "role") {
    return (
      <AuthLayout
        icon={UserPlus}
        title="إنشاء حساب"
        subtitle="اختر نوع حسابك للمتابعة"
        footer={
          <>
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-gold font-semibold hover:underline">
              تسجيل الدخول
            </Link>
          </>
        }
      >
        <div className="space-y-4">
          <RoleCard
            active={accountType === "merchant"}
            onClick={() => setAccountType("merchant")}
            icon={Store}
            title="حساب تاجر"
            desc="مزوّد منتجات — يتطلب رفع السجل التجاري ومراجعة الأدمن."
          />
          <RoleCard
            active={accountType === "buyer"}
            onClick={() => setAccountType("buyer")}
            icon={ShoppingBag}
            title="حساب مشتري"
            desc="زبون عام أو صاحب متجر صغير — تسجيل مباشر دون موافقة."
          />
          <Button
            className="w-full h-12 font-semibold bg-gold text-navy hover:bg-gold/90"
            onClick={() => setStep("details")}
          >
            المتابعة
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ----- خطوة التحقق OTP -----
  if (step === "otp") {
    return (
      <AuthLayout icon={Mail} title="تأكيد البريد الإلكتروني" subtitle={`أرسلنا رمزاً إلى ${email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6" dir="ltr">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-semibold bg-gold text-navy hover:bg-gold/90"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جارٍ التحقق...
            </>
          ) : (
            "تحقّق"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          لم يصلك الرمز؟{" "}
          <button onClick={handleResend} className="text-gold font-medium hover:underline">
            إعادة الإرسال
          </button>
        </p>
      </AuthLayout>
    );
  }

  // ----- خطوة البيانات -----
  return (
    <AuthLayout
      icon={UserPlus}
      title={isMerchant ? "بيانات التاجر" : "بيانات المشتري"}
      subtitle={isMerchant ? "سيتم مراجعة السجل التجاري من قبل الإدارة" : "تسجيل مباشر بدون موافقة"}
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-gold font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </>
      }
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 ml-2" />
        المتابعة عبر Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">أو</span>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <Field id="name" label="الاسم الكامل" icon={UserPlus}>
          <Input
            id="name"
            type="text"
            autoFocus
            placeholder="الاسم الكامل"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="pr-10 h-12"
            required
          />
        </Field>
        <Field id="email" label="البريد الإلكتروني" icon={Mail}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10 h-12"
            required
          />
        </Field>
        <Field id="phone" label="رقم الهاتف" icon={Phone}>
          <Input
            id="phone"
            type="tel"
            placeholder="05xxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pr-10 h-12"
            required
          />
        </Field>

        {isMerchant && (
          <>
            <Field id="business" label="اسم النشاط التجاري" icon={Building2}>
              <Input
                id="business"
                type="text"
                placeholder="اسم المتجر / الشركة"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="pr-10 h-12"
                required
              />
            </Field>
            <div className="space-y-2">
              <Label htmlFor="region">المنطقة</Label>
              <Input
                id="region"
                type="text"
                placeholder="المدينة / المنطقة"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">السجل التجاري (صورة)</Label>
              <label
                htmlFor="license"
                className="flex items-center gap-3 px-4 h-14 rounded-lg border border-dashed border-border cursor-pointer hover:border-gold transition-colors"
              >
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1 truncate">
                  {licenseFile ? licenseFile.name : "اضغط لرفع صورة السجل التجاري"}
                </span>
                <Upload className="w-4 h-4 text-gold" />
              </label>
              <input
                id="license"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          </>
        )}

        <Field id="password" label="كلمة المرور" icon={Lock}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 h-12"
            required
          />
        </Field>
        <Field id="confirm" label="تأكيد كلمة المرور" icon={Lock}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pr-10 h-12"
            required
          />
        </Field>

        <Button type="submit" className="w-full h-12 font-semibold bg-gold text-navy hover:bg-gold/90" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جارٍ الإنشاء...
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

function RoleCard({ active, onClick, icon: Icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-right transition-colors",
        active ? "border-gold bg-gold/10" : "border-border hover:border-gold/50",
      ].join(" ")}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-gold text-navy" : "bg-secondary text-navy"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-navy">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function Field({ id, label, icon: Icon, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}