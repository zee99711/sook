import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useBuyerData, merchantById } from "@/hooks/useBuyerData";
import EmptyState from "@/components/merchant/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Paperclip, Loader2, ArrowRight, Image as ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function BuyerChat() {
  const { user } = useAuth();
  const { merchants } = useBuyerData();
  const [params, setParams] = useSearchParams();
  const merchantParam = params.get("merchant");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadChats = async () => {
    const all = await base44.entities.Chat.list("-updated_at", 50);
    const mine = (all || []).filter((c) => c.participants?.includes(user.id));
    setChats(mine);
    return mine;
  };

  // تهيئة: إنشاء/اختيار محادثة من معامل التاجر
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const mine = await loadChats();
      if (merchantParam) {
        let chat = mine.find((c) => c.participants?.includes(merchantParam));
        if (!chat) {
          chat = await base44.entities.Chat.create({
            participants: [user.id, merchantParam],
            last_message: "",
            updated_at: new Date().toISOString(),
          });
          const fresh = await loadChats();
          setActiveChat(chat.id);
        } else {
          setActiveChat(chat.id);
        }
        setParams({}, { replace: true });
      } else if (mine[0]) {
        setActiveChat(mine[0].id);
      }
      setLoading(false);
    })();
  }, [user, merchantParam]);

  // تحميل الرسائل + الاشتراك اللحظي
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }
    base44.entities.Message.filter({ chat_id: activeChat }, "created_date", 200).then((r) => {
      setMessages(r || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event?.data?.chat_id === activeChat || event?.chat_id === activeChat) {
        setMessages((prev) => [...prev, event.data].filter(Boolean));
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    });
    return unsub;
  }, [activeChat]);

  const send = async () => {
    if (!text.trim() && !uploading) return;
    if (!activeChat) return;
    const body = text.trim();
    setText("");
    try {
      const msg = await base44.entities.Message.create({ chat_id: activeChat, sender_id: user.id, body, attachments: [] });
      setMessages((prev) => [...prev, msg]);
      await base44.entities.Chat.update(activeChat, { last_message: body || "مرفق", updated_at: new Date().toISOString() });
      loadChats();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast({ title: err.message || "فشل الإرسال", variant: "destructive" });
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const msg = await base44.entities.Message.create({ chat_id: activeChat, sender_id: user.id, body: "", attachments: [file_url] });
      setMessages((prev) => [...prev, msg]);
      await base44.entities.Chat.update(activeChat, { last_message: "مرفق", updated_at: new Date().toISOString() });
      loadChats();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast({ title: err.message || "فشل الرفع", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const otherName = (chat) => {
    const otherId = chat?.participants?.find((p) => p !== user.id);
    const m = merchantById(merchants, otherId);
    return m?.business_name || "تاجر";
  };

  if (loading) return <EmptyState loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2"><MessageSquare className="w-6 h-6 text-gold" /> المحادثات</h1>
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[480px]">
        {/* قائمة المحادثات */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            {chats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-6">لا توجد محادثات بعد</p>
            ) : (
              chats.map((c) => (
                <button key={c.id} onClick={() => setActiveChat(c.id)} className={`w-full text-right p-3 border-b border-border flex items-center gap-3 transition ${activeChat === c.id ? "bg-gold/10" : "hover:bg-secondary/50"}`}>
                  <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center font-bold shrink-0">{otherName(c).charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy text-sm truncate">{otherName(c)}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.last_message || "ابدأ المحادثة"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* نافذة المحادثة */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
          {activeChat ? (
            <>
              <div className="px-4 py-3 border-b border-border font-semibold text-navy flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-muted-foreground lg:hidden" />
                {otherName(chats.find((c) => c.id === activeChat))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
                {messages.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">اكتب أول رسالة</p>}
                {messages.map((msg) => {
                  const mine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? "bg-gold text-navy" : "bg-white border border-border"}`}>
                        {msg.body && <p className="text-sm whitespace-pre-line">{msg.body}</p>}
                        {msg.attachments?.map((a, i) => (
                          <a key={i} href={a} target="_blank" rel="noreferrer"><img src={a} alt="مرفق" className="mt-1 rounded-lg max-h-40" /></a>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-border flex items-center gap-2">
                <label className="cursor-pointer p-2 rounded-lg hover:bg-secondary text-navy">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
                <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="اكتب رسالة..." className="h-11" />
                <Button onClick={send} className="h-11 w-11 p-0 bg-gold text-navy hover:bg-gold/90"><Send className="w-5 h-5" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="اختر محادثة" subtitle="ابدأ بالضغط على محادثة من القائمة أو راسل تاجر من صفحة التجار" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}