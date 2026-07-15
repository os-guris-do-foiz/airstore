import React, { useEffect, useRef, useState } from "react";
import { WearInfo, WEAR_SCALE } from "../utils/wear";

interface WearScaleProps {
  wear: WearInfo;
  size?: "sm" | "md";
}

const WearScale: React.FC<WearScaleProps> = ({ wear, size = "sm" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const isSm = size === "sm";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title={`${wear.full} — clique pra ver a escala`}
        className={`tactical-panel-xs flex items-center gap-1 font-black uppercase tracking-widest border backdrop-blur-md transition-transform hover:scale-105 ${
          isSm ? "text-[9px] px-2 py-0.5" : "text-[10px] px-4 py-1.5"
        }`}
        style={{ background: `${wear.color}22`, color: wear.color, borderColor: `${wear.color}66` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: wear.color, boxShadow: `0 0 6px ${wear.color}` }} />
        {isSm ? wear.code : wear.label}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="tactical-panel-sm absolute z-30 top-full left-0 mt-2 w-56 bg-brand-card border border-brand-border shadow-2xl p-3 space-y-1.5"
        >
          <p className="text-[9px] font-mono uppercase tracking-widest text-gray-500 mb-2">
            Escala de Desgaste
          </p>
          {WEAR_SCALE.map((t) => {
            const isCurrent = t.code === wear.code;
            return (
              <div
                key={t.code}
                className={`flex items-center gap-2 px-2 py-1 text-xs transition-colors ${isCurrent ? "bg-white/5" : ""}`}
                style={isCurrent ? { borderLeft: `2px solid ${t.color}` } : { borderLeft: "2px solid transparent" }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color, boxShadow: isCurrent ? `0 0 6px ${t.color}` : undefined }} />
                <span className="font-mono font-bold shrink-0" style={{ color: t.color }}>{t.code}</span>
                <span className={`truncate ${isCurrent ? "text-white font-bold" : "text-gray-400"}`}>{t.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WearScale;
