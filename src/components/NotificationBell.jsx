import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    base44.entities.Notification
      .filter({ user_id: user.id }, "-created_date", 20)
      .then((r) => { setItems(r || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event?.data?.user_id === user.id) {
        setItems((prev) => [event.data, ...prev].slice(0, 30));
      }
    });
    return unsub;
  }, [user]);

  const unread = items.filter((n) => !n.is_read).length;

  const markAll = async () => {
    const unreadItems = items.filter((n) => !n.is_read);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    for (const n of unreadItems) {
      try { await base44.entities.Notification.update(n.id, { is_read: true }); } catch {}
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="p-2 rounded-lg hover:bg-secondary relative" aria-label="الإشعارات">
        <Bell className="w-5 h-5 text-navy" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-80 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-navy">الإشعارات</span>
              {unread > 0 && <button onClick={markAll} className="text-xs text-gold hover:underline">تعليم الكل كمقروء</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground text-center">جارٍ التحميل...</p>
              ) : items.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">لا توجد إشعارات</p>
              ) : (
                items.map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 ${n.is_read ? "" : "bg-gold/5"}`}>
                    <p className="text-sm font-medium text-navy">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.created_date).toLocaleString("ar-EG")}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}