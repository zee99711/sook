// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Percent } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { settingsAPI } from '@/api/entities';
import { clearCommissionCache } from '@/lib/commissions';
import { useAuth } from '@/lib/AuthContext';
import { logAction } from '@/lib/audit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    id: null,
    cod_rate: 0.03,
    usdt_rate: 0.02,
    shamcash_rate: 0.025,
    syrcash_rate: 0.025,
    tax_rate: 0,
    app_name: 'سوق الوسيط',
    support_email: '',
    support_phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsAPI.get();
        if (data) setSettings((s) => ({ ...s, ...data }));
      } catch (err) {
        console.warn('No settings found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        cod_rate: Number(settings.cod_rate),
        usdt_rate: Number(settings.usdt_rate),
        shamcash_rate: Number(settings.shamcash_rate),
        syrcash_rate: Number(settings.syrcash_rate),
        tax_rate: Number(settings.tax_rate),
        app_name: settings.app_name,
        support_email: settings.support_email,
        support_phone: settings.support_phone,
        updated_at: new Date().toISOString(),
      };

      if (settings.id) {
        await settingsAPI.update(settings.id, payload);
      } else {
        await settingsAPI.create(payload);
      }

      clearCommissionCache();
      await logAction(user, 'update_settings', 'app_settings', JSON.stringify(payload));
      toast.success('تم حفظ الإعدادات');
    } catch (err) {
      console.error(err);
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>;
  }

  return (
    <div>
      <PageHeader
        icon={SettingsIcon}
        title="الإعدادات العامة"
        subtitle="إعدادات المنصة والعمولات"
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
        {/* العمولات */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-bold text-navy">نسب العمولات</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'cod_rate', label: 'دفع عند التسليم' },
              { key: 'usdt_rate', label: 'محفظة USDT' },
              { key: 'shamcash_rate', label: 'شام كاش' },
              { key: 'syrcash_rate', label: 'سيريتل كاش' },
              { key: 'tax_rate', label: 'الضريبة' },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={settings[key]}
                    onChange={(e) => update(key, e.target.value)}
                    dir="ltr"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    = {(Number(settings[key]) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* معلومات المنصة */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold text-navy mb-4">معلومات المنصة</h2>

          <div className="space-y-4">
            <div>
              <Label>اسم المنصة</Label>
              <Input
                value={settings.app_name}
                onChange={(e) => update('app_name', e.target.value)}
              />
            </div>
            <div>
              <Label>بريد الدعم</Label>
              <Input
                type="email"
                value={settings.support_email}
                onChange={(e) => update('support_email', e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <Label>هاتف الدعم</Label>
              <Input
                value={settings.support_phone}
                onChange={(e) => update('support_phone', e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gold/10 rounded-xl text-xs text-navy leading-relaxed">
            <strong>ℹ️ ملاحظة:</strong> العمولات تُحسب على المشتري عند الدفع،
            وتُخصم من مستحقات التاجر عند التسليم.
          </div>
        </div>
      </div>
    </div>
  );
}