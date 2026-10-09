// src/pages/merchant/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Settings, Save, Upload, Copy } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const REGIONS = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة',
];

export default function MerchantProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    display_name: '',
    phone: '',
    region: '',
  });
  const [merchant, setMerchant] = useState({
    business_name: '',
    description: '',
    region: '',
    address: '',
    invite_code: '',
    license_verified: false,
    license_file: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    setProfile({
      full_name: user.full_name || '',
      display_name: user.display_name || '',
      phone: user.phone || '',
      region: user.region || '',
    });

    supabase
      .from('merchant_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setMerchant({
            business_name: data.business_name || '',
            description: data.description || '',
            region: data.region || '',
            address: data.address || '',
            invite_code: data.invite_code || '',
            license_verified: data.license_verified || false,
            license_file: data.commercial_license_file || '',
          });
        }
      });
  }, [user?.id]);

  const save = async () => {
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          display_name: profile.display_name,
          phone: profile.phone,
          region: profile.region,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      const { data: existing } = await supabase
        .from('merchant_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('merchant_profiles')
          .update({
            business_name: merchant.business_name,
            description: merchant.description,
            region: merchant.region,
            address: merchant.address,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        await supabase.from('merchant_profiles').insert({
          user_id: user.id,
          business_name: merchant.business_name,
          description: merchant.description,
          region: merchant.region,
          address: merchant.address,
        });
      }

      toast.success('تم الحفظ');
    } catch (err) {
      console.error(err);
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const uploadLicense = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `licenses/${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      await supabase
        .from('merchant_profiles')
        .upsert({
          user_id: user.id,
          commercial_license_file: publicUrl,
        }, { onConflict: 'user_id' });

      setMerchant((prev) => ({ ...prev, license_file: publicUrl }));
      toast.success('تم رفع السجل التجاري — سيتم المراجعة قريباً');
    } catch (err) {
      console.error(err);
      toast.error('فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/register?invite=${merchant.invite_code}`;
    navigator.clipboard.writeText(link);
    toast.success('تم نسخ رابط الدعوة');
  };

  return (
    <div>
      <PageHeader
        icon={Settings}
        title="الملف والإعدادات"
        subtitle="إدارة بياناتك الشخصية وبيانات المتجر"
        action={
          <Button
            onClick={save}
            disabled={saving}
            className="bg-navy text-white hover:bg-navy/90"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* البيانات الشخصية */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">البيانات الشخصية</h2>
          <div className="space-y-4">
            <div>
              <Label>الاسم الكامل</Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>الاسم المعروض</Label>
              <Input
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input value={user?.email || ''} disabled dir="ltr" />
            </div>
            <div>
              <Label>رقم الجوال</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* بيانات المتجر */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">بيانات المتجر</h2>
          <div className="space-y-4">
            <div>
              <Label>اسم النشاط التجاري</Label>
              <Input
                value={merchant.business_name}
                onChange={(e) =>
                  setMerchant({ ...merchant, business_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>المنطقة</Label>
              <select
                value={merchant.region}
                onChange={(e) =>
                  setMerchant({ ...merchant, region: e.target.value })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">اختر المنطقة</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>العنوان التفصيلي</Label>
              <Input
                value={merchant.address}
                onChange={(e) =>
                  setMerchant({ ...merchant, address: e.target.value })
                }
              />
            </div>
            <div>
              <Label>وصف المتجر</Label>
              <textarea
                value={merchant.description}
                onChange={(e) =>
                  setMerchant({ ...merchant, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-md border border-input bg-background p-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* السجل التجاري */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">السجل التجاري</h2>
          {merchant.license_verified ? (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">
              ✅ تم التحقق من سجلك التجاري
            </div>
          ) : merchant.license_file ? (
            <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm font-medium">
              ⏳ قيد المراجعة من قبل الإدارة
            </div>
          ) : (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium mb-4">
              ⚠️ لم يتم رفع السجل التجاري بعد
            </div>
          )}

          <label className="mt-4 block">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={uploadLicense}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border hover:border-gold cursor-pointer transition-colors text-sm">
              <Upload className="w-4 h-4" />
              {uploading ? 'جارٍ الرفع...' : 'رفع صورة السجل التجاري'}
            </span>
          </label>

          {merchant.license_file && (
            <a
              href={merchant.license_file}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-xs text-gold hover:underline"
            >
              عرض الملف المرفوع
            </a>
          )}
        </div>

        {/* كود الدعوة */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">كود الدعوة</h2>
          <p className="text-sm text-muted-foreground mb-3">
            شارك هذا الرابط مع زبائنك الخاصين لربطهم بحسابك:
          </p>
          <div className="bg-secondary rounded-lg p-3 flex items-center justify-between gap-2">
            <code className="text-sm font-mono text-navy break-all" dir="ltr">
              {`${window.location.origin}/register?invite=${merchant.invite_code || '...'}`}
            </code>
            <Button size="sm" variant="outline" onClick={copyInviteLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {merchant.invite_code && (
            <p className="text-xs text-muted-foreground mt-2">
              كود الدعوة: <strong className="text-navy">{merchant.invite_code}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}