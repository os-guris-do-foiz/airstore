import React, { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Home, Search, Crosshair, RadioTower } from "lucide-react";
import CornerBrackets from "../components/CornerBrackets";

const MESSAGES = [
  "Você avançou além da linha demarcada. Não há nada mapeado por aqui.",
  "Sinal perdido. A rota que você procura saiu de posição.",
  "Coordenada fora do grid. Nenhum ponto de extração neste setor.",
  "Área não reconhecida pelo comando. Recomendamos retornar à base.",
  "Reconhecimento negativo: esta página não consta no mapa do campo.",
];

const STATUS_LINES = [
  "CONEXÃO INTERROMPIDA",
  "ROTA NÃO CONFIRMADA",
  "SETOR DESCONHECIDO",
  "FORA DE ALCANCE",
];

const randHex = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase();

const NotFound: React.FC = () => {
  const location = useLocation();

  const hud = useMemo(
    () => ({
      message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
      status: STATUS_LINES[Math.floor(Math.random() * STATUS_LINES.length)],
      trace: randHex(8),
      lat: (Math.random() * 180 - 90).toFixed(4),
      lng: (Math.random() * 360 - 180).toFixed(4),
      signal: Math.floor(Math.random() * 24), // fraco, afinal está perdido
      grid: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 90 + 10)}`,
    }),
    []
  );

  useEffect(() => {
    document.title = "404 · Setor não mapeado — Fronteira Airsoft";
    return () => {
      document.title = "Fronteira Airsoft | A Elite do Airsoft Brasil";
    };
  }, []);

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-brand-card border border-brand-border tactical-panel p-8 md:p-14 text-center overflow-hidden"
      >
        <CornerBrackets corners={["tl", "br"]} color="var(--color-brand-purple)" size={22} thickness={2} />

        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-purple/10 blur-[100px]" />

        <div className="relative inline-flex items-center gap-2 bg-brand-purple/15 text-brand-purple-light px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-purple/30 mb-8">
          <RadioTower size={12} />
          {hud.status}
        </div>

        <div className="relative mb-2 select-none">
          <motion.h1
            animate={{ x: [0, -1.5, 1.5, 0], opacity: [1, 0.92, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-[6rem] md:text-[9rem] font-black leading-none tracking-tighter text-white font-display"
            style={{ textShadow: "3px 0 var(--color-brand-purple), -3px 0 var(--color-brand-cyan)" }}
          >
            404
          </motion.h1>
          <Crosshair
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary/20"
            size={180}
            strokeWidth={0.6}
          />
        </div>

        <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight mb-3">
          Setor não mapeado
        </h2>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-8">
          {hud.message}
        </p>

        <div className="grid grid-cols-3 gap-px bg-brand-border/60 border border-brand-border tactical-panel-xs text-left mb-9 font-mono overflow-hidden">
          {[
            { k: "COORD", v: `${hud.lat}, ${hud.lng}` },
            { k: "GRID", v: hud.grid },
            { k: "SINAL", v: `${hud.signal}%` },
          ].map((cell) => (
            <div key={cell.k} className="bg-brand-bg px-3 py-2.5">
              <div className="text-[8px] text-gray-600 font-black tracking-widest">{cell.k}</div>
              <div className="text-[11px] text-brand-primary-light truncate">{cell.v}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-black px-6 py-3 tactical-panel-xs font-black uppercase tracking-widest text-sm transition-all"
          >
            <Home size={16} /> Voltar à base
          </Link>
          <Link
            to="/ads"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-bg border border-brand-border hover:border-brand-purple text-white px-6 py-3 tactical-panel-xs font-black uppercase tracking-widest text-sm transition-colors"
          >
            <Search size={16} /> Ver anúncios
          </Link>
        </div>

        <div className="mt-8 pt-5 border-t border-brand-border/60 text-[10px] font-mono text-gray-600 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>ROTA: <span className="text-gray-500">{location.pathname}</span></span>
          <span>TRACE: <span className="text-gray-500">{hud.trace}</span></span>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
