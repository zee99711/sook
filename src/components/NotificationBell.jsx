// src/components/NotificationBell.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { notificationsAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // تحميل الإشعارات
  const load = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await notificationsAPI.listForUser(user.id, 20);
      setItems(data || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    // تنظيف القناة القديمة
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setItems((prev) => [payload.new, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  const unread = items.filter((n) => !n.is_read).length;

  const markAll = async () => {
    if (!user?.id) return;
    // تحديث محلي فوري (Optimistic)
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationsAPI.markAllRead(user.id);
    } catch (err) {
      console.warn('Failed to mark all read:', err);
      // إعادة التحميل في حال الفشل
      load();
    }
  };

  const markOne = async (id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationsAPI.markRead(id);
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `قبل ${diffMin} د`;
    if (diffHr < 24) return `قبل ${diffHr} س`;
    if (diffDay < 7) return `قبل ${diffDay} ي`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-secondary relative"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5 text-navy" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute left-0 mt-2 w-80 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-navy">الإشعارات</span>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="text-xs text-gold hover:underline"
                >
                  تعليم الكل كمقروء
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  جارٍ التحميل...
                </p>
              ) : items.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">
                  لا توجد إشعارات
                </p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    className={`w-full text-right px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${
                      n.is_read ? '' : 'bg-gold/5'
                    }`}
                  >
                    <p className="text-sm font-medium text-navy">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatTime(n.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}