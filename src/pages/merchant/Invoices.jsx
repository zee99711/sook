// src/pages/merchant/Invoices.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Download, Check, X, Truck, Package } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { invoicesAPI, profilesAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { notifyBuyerOnStatus } from '@/lib/notify';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

export default function MerchantInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const load = async () => {
    if (!user?.id) return;
    try {
      const data = await invoicesAPI.listByMerchant(user.id);
      setInvoices(data);
    } catch (err) {
      toast.error('فشل تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const grouped = useMemo(
    () => ({
      pending: invoices.filter((i) => i.status === 'pending'),
      confirmed: invoices.filter((i) => i.status === 'confirmed'),
      shipped: invoices.filter((i) => i.status === 'shipped'),
      delivered: invoices.filter((i) => i.status === 'delivered'),
    }),
    [invoices]
  );

  const updateStatus = async (invoice, newStatus) => {
    try {
      await invoicesAPI.updateStatus(invoice.id, newStatus);

      // إشعار المشتري
      const statusKey =
        newStatus === 'confirmed'
          ? 'confirmed'
          : newStatus === 'shipped'
          ? 'shipped'
          : newStatus === 'delivered'
          ? 'delivered'
          : newStatus === 'rejected'
          ? 'rejected'
          : null;

      if (statusKey) {
        const merchantName = user.display_name || user.full_name || 'التاجر';
        await notifyBuyerOnStatus(invoice, merchantName, statusKey);
      }

      toast.success('تم تحديث الحالة');
      load();
    } catch (err) {
      console.error(err);
      toast.error('فشل التحديث');
    }
  };

  const InvoiceRow = ({ inv }) => {
    const statusLabel = (s) =>
      ({
        pending: 'قيد المراجعة',
        confirmed: 'مؤكد',
        shipped: 'قيد التسليم',
        delivered: 'مكتمل',
        rejected: 'مرفوض',
        cancelled: 'ملغى',
      }[s] || s);

    return (
      <div className="bg-card rounded-2xl border border-border p-4 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-navy/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-navy" />
            </div>
            <div>
              <p className="font-bold text-navy">{inv.invoice_number}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(inv.created_at).toLocaleDateString('ar-EG')} ·{' '}
                {inv.payment_method}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-xs text-muted-foreground">الإجمالي</p>
              <p className="font-bold text-navy">
                {Number(inv.total).toFixed(2)} ر.س
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-navy/10 text-navy font-medium">
              {statusLabel(inv.status)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {inv.pdf_url && (
            <a
              href={inv.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل PDF
            </a>
          )}

          {inv.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus(inv, 'confirmed')}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Check className="w-3.5 h-3.5 ml-1" />
                تأكيد
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(inv, 'rejected')}
                className="text-destructive border-destructive/30"
              >
                <X className="w-3.5 h-3.5 ml-1" />
                رفض
              </Button>
            </>
          )}

          {inv.status === 'confirmed' && (
            <Button
              size="sm"
              onClick={() => updateStatus(inv, 'shipped')}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Truck className="w-3.5 h-3.5 ml-1" />
              شحن
            </Button>
          )}

          {inv.status === 'shipped' && (
            <Button
              size="sm"
              onClick={() => updateStatus(inv, 'delivered')}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Package className="w-3.5 h-3.5 ml-1" />
              تسليم
            </Button>
          )}
        </div>
      </div>
    );
  };

  const EmptyState = ({ message }) => (
    <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="الفواتير"
        subtitle={`${invoices.length} فاتورة`}
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              جديدة ({grouped.pending.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              مؤكدة ({grouped.confirmed.length})
            </TabsTrigger>
            <TabsTrigger value="shipped">
              قيد التسليم ({grouped.shipped.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              مكتملة ({grouped.delivered.length})
            </TabsTrigger>
          </TabsList>

          {['pending', 'confirmed', 'shipped', 'delivered'].map((key) => (
            <TabsContent key={key} value={key}>
              {grouped[key].length === 0 ? (
                <EmptyState message="لا توجد فواتير في هذه الحالة" />
              ) : (
                grouped[key].map((inv) => <InvoiceRow key={inv.id} inv={inv} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}