// src/pages/buyer/Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/api/supabaseClient';
import { chatsAPI } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BuyerChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // تحميل المحادثات
  useEffect(() => {
    if (!user?.id) return;
    chatsAPI
      .listForUser(user.id)
      .then(setChats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // تحميل الرسائل
  useEffect(() => {
    if (!activeChat?.id) return;
    chatsAPI.messages(activeChat.id).then(setMessages);

    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${activeChat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChat?.id]);

  // التمرير التلقائي
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat?.id || !user?.id) return;
    setSending(true);
    try {
      await chatsAPI.sendMessage({
        chat_id: activeChat.id,
        sender_id: user.id,
        body: newMessage.trim(),
      });
      setNewMessage('');
      // تحديث last_message
      await supabase
        .from('chats')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', activeChat.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader icon={MessageSquare} title="المحادثات" subtitle="تواصل مع التجار" />

      <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ height: '600px' }}>
        <div className="grid grid-cols-3 h-full">
          {/* قائمة المحادثات */}
          <div className="col-span-1 border-l border-border overflow-y-auto">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="بحث..." className="pr-10" />
              </div>
            </div>

            {loading ? (
              <p className="p-4 text-sm text-muted-foreground text-center">جارٍ التحميل...</p>
            ) : chats.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                لا توجد محادثات بعد
              </p>
            ) : (
              chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChat(c)}
                  className={`w-full p-3 text-right border-b border-border hover:bg-secondary/50 transition-colors ${
                    activeChat?.id === c.id ? 'bg-gold/5' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-navy truncate">
                    محادثة #{c.id.slice(0, 6)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.last_message || 'لا توجد رسائل'}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* نافذة المحادثة */}
          <div className="col-span-2 flex flex-col h-full">
            {activeChat ? (
              <>
                <div className="p-4 border-b border-border">
                  <p className="font-bold text-navy">
                    محادثة #{activeChat.id.slice(0, 6)}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender_id === user?.id ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          m.sender_id === user?.id
                            ? 'bg-navy text-white'
                            : 'bg-secondary text-navy'
                        }`}
                      >
                        <p className="text-sm">{m.body}</p>
                        <p className="text-[10px] opacity-70 mt-1">
                          {new Date(m.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="اكتب رسالتك..."
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-navy text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">اختر محادثة للبدء</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}