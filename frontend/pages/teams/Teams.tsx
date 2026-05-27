import React from "react";
import { Users, Shield, Trophy, MessageSquare, Zap } from "lucide-react";
import { motion } from "motion/react";

const Teams: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-4 bg-brand-primary/10 rounded-3xl mb-6"
        >
          <Users size={48} className="text-brand-primary" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
          Times & <span className="text-brand-primary-light">Operadores</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto uppercase font-black tracking-[0.2em] text-xs">
          Organize seu grupo, recrute novos membros e gerencie sua equipe
        </p>
      </section>

      {/* Concept Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-brand-card border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] -mr-48 -mt-48" />

          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white uppercase leading-none">
                Em desenvolvimento...
              </h2>
              <p className="text-brand-primary-light font-bold">
                Estamos criando a central definitiva para equipes de Airsoft.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-gray-400 leading-relaxed">
                A ideia é simples: permitir que você crie o perfil do seu time,
                defina sua base, estilo de jogo e recrute novos operadores.
                Jogadores solo poderão encontrar equipes próximas e solicitar
                entrada em grupos ativos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Shield size={18} />, text: "Gestão de Membros" },
                  { icon: <Trophy size={18} />, text: "Histórico de Missões" },
                  {
                    icon: <MessageSquare size={18} />,
                    text: "Chat Interno do Time",
                  },
                  { icon: <Zap size={18} />, text: "Desafios entre Equipes" },
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
              <Users size={120} className="text-brand-primary/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Teams;
