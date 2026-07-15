import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ThumbsUp, ThumbsDown, Hourglass, Dot, Flag, Bug } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { notificationsApi, AppNotification } from "../api/notifications";
import { isLoggedIn } from "../utils/auth";
import CornerBrackets from "./CornerBrackets";

const iconFor = (type: AppNotification["type"]) => {
  switch (type) {
    case "EVENT_PENDING": return <Hourglass size={16} className="text-yellow-500" />;
    case "EVENT_APPROVED": return <ThumbsUp size={16} className="text-brand-green" />;
    case "EVENT_REJECTED": return <ThumbsDown size={16} className="text-red-400" />;
    case "REPORT": return <Flag size={16} className="text-red-500" />;
    case "REPORT_BUG": return <Bug size={16} className="text-brand-primary" />;
    default: return <Dot size={16} className="text-gray-400" />;
  }
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    if (!isLoggedIn()) return;
    notificationsApi
      .list()
      .then((res) => { setItems(res.items); setUnread(res.unread); })
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoggedIn()) return;
    load();
    const poll = setInterval(load, 60000);

    let es: EventSource | null = null;
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = async () => {
      if (closed) return;
      try {
        const { ticket } = await notificationsApi.getSseTicket();
        if (closed) return;
        es = new EventSource(`/api/notifications/stream?ticket=${encodeURIComponent(ticket)}`);
        es.onmessage = () => load();
        es.onerror = () => {
          es?.close();
          es = null;
          if (!closed) {
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(connect, 5000); // reconecta com ticket novo
          }
        };
      } catch {
        if (!closed) {
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(connect, 15000);
        }
      }
    };
    connect();

    return () => {
      closed = true;
      clearInterval(poll);
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) load();
  };

  const handleClick = async (n: AppNotification) => {
    if (!n.is_read) {
      try { await notificationsApi.markRead(n.id); } catch {}
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    try { await notificationsApi.markAllRead(); } catch {}
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
  };

  if (!isLoggedIn()) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="tactical-panel-xs relative w-12 h-12 bg-brand-card border border-brand-border flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary/40 transition-all"
        title="Notificações"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="tactical-panel-sm absolute right-0 mt-2 w-80 max-w-[90vw] bg-brand-card border border-brand-border shadow-2xl overflow-hidden z-50"
          >
            <CornerBrackets corners={["tr", "bl"]} size={12} />
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
              <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Bell size={14} className="text-brand-primary" /> Notificações
              </span>
              {items.some((i) => !i.is_read) && (
                <button onClick={markAll} className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-primary-light flex items-center gap-1">
                  <CheckCheck size={12} /> Ler todas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-gray-600 text-sm italic">Nenhuma notificação.</div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-brand-border/50 hover:bg-white/5 transition-colors ${n.is_read ? "opacity-60" : "bg-brand-primary/[0.04]"}`}
                  >
                    <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{timeAgo(n.created_at)} atrás</span>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-1.5" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
