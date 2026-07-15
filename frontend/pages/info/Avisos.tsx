import React from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  Megaphone,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";

const Avisos: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-4 bg-brand-primary/10 rounded-3xl mb-6"
        >
          <Bell size={48} className="text-brand-primary" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
          Mural de <span className="text-brand-primary-light">Avisos</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto uppercase font-black tracking-[0.2em] text-xs">
          Fique por dentro de tudo o que acontece na comunidade
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-brand-card border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] -mr-48 -mt-48" />

          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white uppercase leading-none">
                Em desenvolvimento...
              </h2>
              <p className="text-brand-primary-light font-bold">
                O canal oficial de comunicação da comunidade.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-gray-400 leading-relaxed">
                O Mural de Avisos será o local para comunicados importantes,
                alertas sobre equipamentos roubados, atualizações da plataforma
                e notícias relevantes para todos os operadores de Airsoft.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: <AlertTriangle size={18} />,
                    text: "Equipamentos Roubados",
                  },
                  {
                    icon: <Megaphone size={18} />,
                    text: "Comunicados Oficiais",
                  },
                  { icon: <Info size={18} />, text: "Atualizações do Site" },
                  {
                    icon: <ShieldAlert size={18} />,
                    text: "Alertas de Segurança",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-gray-400"
                  >
                    <div className="text-brand-primary">{item.icon}</div>
                    <span className="text-sm font-bold">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button className="bg-brand-primary hover:bg-brand-primary-light text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-white/10">
                Quero ser avisado
              </button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="aspect-square bg-gradient-to-br from-brand-primary/20 to-transparent rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bell size={120} className="text-brand-primary/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Avisos;
