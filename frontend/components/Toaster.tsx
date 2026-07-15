import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { subscribeToast, ToastItem } from "../utils/toast";

const config = {
  success: { icon: CheckCircle2, color: "text-brand-green", border: "border-brand-green/40", glow: "shadow-brand-green/10" },
  error: { icon: XCircle, color: "text-red-400", border: "border-red-500/40", glow: "shadow-red-500/10" },
  info: { icon: Info, color: "text-brand-primary", border: "border-brand-primary/40", glow: "shadow-brand-primary/10" },
};

const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    });
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[calc(100vw-3rem)] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const c = config[t.type];
          const Icon = c.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 bg-brand-card border ${c.border} rounded-2xl p-4 shadow-2xl ${c.glow} backdrop-blur-xl`}
            >
              <Icon className={`${c.color} shrink-0 mt-0.5`} size={20} />
              <p className="flex-1 text-sm text-gray-200 leading-snug font-medium">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-gray-500 hover:text-white transition-colors shrink-0">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
