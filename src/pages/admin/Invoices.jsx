// src/pages/admin/Invoices.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Search, Download } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { invoicesAPI } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { exportCSV } from '@/lib/exportUtils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    invoicesAPI
      .listAll()
      .then(setInvoices)
      .catch(() => toast.error('فشل التحميل'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(
    () => ({
      all: invoices,
      pending: invoices.filter((i) => i.status === 'pending'),
      confirmed: invoices.filter((i) => i.status === 'confirmed'),
      shipped: invoices.filter((i) => i.status === 'shipped'),
      delivered: invoices.filter((i) => i.status === 'delivered'),
      rejected: invoices.filter((i) => i.status === 'rejected'),
    }),
    [invoices]
  );

  const filtered = useMemo(() => {
    const list = grouped[tab] || [];
    if (!search) return list;
    return list.filter((i) =>
      i.invoice_number?.toLowerCase().includes(search.toLowerCase())
    );
  }, [grouped, tab, search]);

  const handleExport = () => {
    const headers = ['رقم الفاتورة', 'الحالة', 'المجموع', 'العمولة', 'التاريخ'];
    const rows = filtered.map((i) => [
      i.invoice_number,
      i.status,
      i.total,
      i.commission,
      new Date(i.created_at).toLocaleDateString('ar-EG'),
    ]);
    exportCSV('invoices', headers, rows);
    toast.success('تم التصدير');
  };

  const statusLabel = (s) =>
    ({
      pending: 'قيد المراجعة',
      confirmed: 'مؤكد',
      shipped: 'قيد التسليم',
      delivered: 'مكتمل',
      rejected: 'مرفوض',
      cancelled: 'ملغى',
    }[s] || s);

  const totalCommission = filtered
    .filter((i) => i.status === 'delivered')
    .reduce((s, i) => s + Number(i.commission || 0), 0);

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="إدارة الفواتير"
        subtitle={`${invoices.length} فاتورة · عمولة محققة: ${totalCommission.toFixed(2)} ر.س`}
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم الفاتورة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">الكل ({grouped.all.length})</TabsTrigger>
          <TabsTrigger value="pending">قيد المراجعة ({grouped.pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed">مؤكدة ({grouped.confirmed.length})</TabsTrigger>
          <TabsTrigger value="shipped">قيد التسليم ({grouped.shipped.length})</TabsTrigger>
          <TabsTrigger value="delivered">مكتملة ({grouped.delivered.length})</TabsTrigger>
          <TabsTrigger value="rejected">مرفوضة ({grouped.rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد فواتير</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-right p-4 font-semibold text-navy">رقم الفاتورة</th>
                      <th className="text-right p-4 font-semibold text-navy">التاريخ</th>
                      <th className="text-right p-4 font-semibold text-navy">طريقة الدفع</th>
                      <th className="text-right p-4 font-semibold text-navy">الإجمالي</th>
                      <th className="text-right p-4 font-semibold text-navy">العمولة</th>
                      <th className="text-right p-4 font-semibold text-navy">الحالة</th>
                      <th className="text-right p-4 font-semibold text-navy"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => (
                      <tr key={inv.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="p-4 font-medium text-navy">{inv.invoice_number}</td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {new Date(inv.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {inv.payment_method || '—'}
                        </td>
                        <td className="p-4 font-medium text-navy">
                          {Number(inv.total).toFixed(2)}
                        </td>
                        <td className="p-4 text-gold font-medium">
                          {Number(inv.commission || 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-navy/10 text-navy font-medium">
                            {statusLabel(inv.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          {inv.pdf_url && (
                            <a
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-gold hover:underline"
                            >
                              PDF
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}