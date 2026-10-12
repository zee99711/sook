// src/pages/buyer/Orders.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Package, FileText, Download, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { invoicesAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { shareOnWhatsApp, buildInvoiceShareText } from '@/lib/notify';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function BuyerOrders() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user?.id) return;
    invoicesAPI
      .listByBuyer(user.id)
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const grouped = useMemo(
    () => ({
      all: invoices,
      pending: invoices.filter((i) => i.status === 'pending'),
      confirmed: invoices.filter((i) => i.status === 'confirmed'),
      shipped: invoices.filter((i) => i.status === 'shipped'),
      delivered: invoices.filter((i) => i.status === 'delivered'),
    }),
    [invoices]
  );

  const statusLabel = (s) =>
    ({
      pending: 'قيد المراجعة',
      confirmed: 'مؤكد',
      shipped: 'قيد التسليم',
      delivered: 'مكتمل',
      rejected: 'مرفوض',
      cancelled: 'ملغى',
    }[s] || s);

  const statusColor = (s) =>
    ({
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }[s] || 'bg-gray-100 text-gray-800');

  const handleShareWhatsApp = (inv) => {
    const buyerName = user.display_name || user.full_name || 'المشتري';
    const text = buildInvoiceShareText(inv, 'التاجر', buyerName, inv.items || []);
    shareOnWhatsApp(text);
  };

  const InvoiceCard = ({ inv }) => (
    <div className="bg-card rounded-2xl border border-border p-4 mb-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-navy/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-navy" />
          </div>
          <div>
            <p className="font-bold text-navy">{inv.invoice_number}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(inv.created_at).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(inv.status)}`}
          >
            {statusLabel(inv.status)}
          </span>
          <span className="font-bold text-navy">
            {Number(inv.total).toFixed(2)} ر.س
          </span>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        {inv.pdf_url && (
          <a
            href={inv.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            تحميل PDF
          </a>
        )}

        <button
          onClick={() => handleShareWhatsApp(inv)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          مشاركة واتساب
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        icon={Package}
        title="طلباتي"
        subtitle={`${invoices.length} طلب`}
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">الكل ({grouped.all.length})</TabsTrigger>
            <TabsTrigger value="pending">
              قيد المراجعة ({grouped.pending.length})
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

          {Object.entries(grouped).map(([key, list]) => (
            <TabsContent key={key} value={key}>
              {list.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  لا توجد طلبات في هذه الحالة
                </p>
              ) : (
                list.map((inv) => <InvoiceCard key={inv.id} inv={inv} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}