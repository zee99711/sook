// src/pages/buyer/Profile.jsx
import React, { useEffect, useState } from 'react';
import { User, Save, Star } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { reviewsAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const REGIONS = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'درعا', 'السويداء', 'القنيطرة',
];

export default function BuyerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    display_name: '',
    phone: '',
    region: '',
    address: '',
  });
  const [myReviews, setMyReviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    setProfile({
      full_name: user.full_name || '',
      display_name: user.display_name || '',
      phone: user.phone || '',
      region: user.region || '',
      address: user.address || '',
    });

    supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMyReviews(data || []));
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
          address: profile.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      toast.success('تم الحفظ');
    } catch (err) {
      console.error(err);
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={User}
        title="الملف الشخصي"
        subtitle="إدارة بياناتك الشخصية"
        action={
          <Button
            onClick={save}
            disabled={saving}
            className="bg-navy text-white hover:bg-navy/90"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div>
              <Label>المنطقة</Label>
              <select
                value={profile.region}
                onChange={(e) => setProfile({ ...profile, region: e.target.value })}
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
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">تقييماتي للتجار</h2>
          {myReviews.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              لم تقم بأي تقييم بعد
            </p>
          ) : (
            <div className="space-y-3">
              {myReviews.map((r) => (
                <div key={r.id} className="bg-secondary/40 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${
                          n <= r.rating ? 'text-gold fill-gold' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="text-xs text-muted-foreground">{r.comment}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {new Date(r.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}