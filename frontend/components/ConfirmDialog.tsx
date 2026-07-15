import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { subscribeConfirm, ConfirmRequest } from "../utils/confirm";
import CornerBrackets from "./CornerBrackets";

const ConfirmDialog: React.FC = () => {
  const [req, setReq] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    return subscribeConfirm((r) => setReq(r));
  }, []);

  const close = (ok: boolean) => {
    if (req) req.resolve(ok);
    setReq(null);
  };

  useEffect(() => {
    if (!req) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [req]);

  const danger = req?.options.danger;
  const Icon = danger ? AlertTriangle : HelpCircle;

  return (
    <AnimatePresence>
      {req && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => close(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="tactical-panel relative z-10 bg-brand-card w-full max-w-md border border-brand-border p-8 shadow-2xl text-center"
          >
            <CornerBrackets corners={["tr", "bl"]} color={danger ? "#ef4444" : "var(--color-brand-primary)"} size={16} />
            <div
              className={`tactical-panel-sm mx-auto w-16 h-16 flex items-center justify-center mb-5 border ${
                danger
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
              }`}
            >
              <Icon size={30} />
            </div>

            {req.options.title && (
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                {req.options.title}
              </h3>
            )}
            <p className="text-gray-400 text-sm leading-relaxed mb-7 whitespace-pre-line">
              {req.options.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => close(false)}
                className="tactical-panel-xs flex-1 py-3 border border-brand-border text-gray-400 hover:text-white hover:border-gray-500 text-xs font-black uppercase tracking-widest transition-colors"
              >
                {req.options.cancelText || "Cancelar"}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                className={`tactical-panel-xs flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                  danger
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-brand-primary text-black hover:bg-brand-primary-light"
                }`}
              >
                {req.options.confirmText || "Confirmar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
