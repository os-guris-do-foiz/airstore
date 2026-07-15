import React, { useEffect, useState } from "react";
import {
  Heart,
  Coffee,
  Shield,
  Users,
  Zap,
  Target,
  Crown,
  ArrowUp,
  Eye,
  Trophy,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { donationsApi, Donation } from "../api/donations";

const About: React.FC = () => {
  const [donors, setDonors] = useState<Donation[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(true);

  useEffect(() => {
    donationsApi.getMural(20)
      .then(setDonors)
      .catch(() => setDonors([]))
      .finally(() => setLoadingDonors(false));
  }, []);
  return (
    <div className="min-h-screen pb-20">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-primary/20 text-brand-primary-light px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-brand-primary/30"
          >
            <Heart size={14} className="fill-brand-primary-light" />
            Projeto Comunitário
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-8"
          >
            Feito por jogadores, <br />
            <span className="text-brand-primary-light text-gradient bg-clip-text">
              para jogadores.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto"
          >
            O Fronteira Airsoft nasceu para ser a ferramenta definitiva de
            organização da nossa comunidade. Nosso objetivo é facilitar a busca
            e ajudar você a encontrar exatamente o que está procurando.
          </motion.p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {[
          {
            icon: <Target className="text-brand-primary" size={32} />,
            title: "Organização",
            desc: "Filtros inteligentes e categorias precisas para você não perder tempo procurando.",
          },
          {
            icon: <Shield className="text-brand-green" size={32} />,
            title: "Conexão",
            desc: "Aproximamos compradores, vendedores e prestadores de serviço em um só lugar.",
          },
          {
            icon: <Zap className="text-brand-primary-light" size={32} />,
            title: "Agilidade",
            desc: "Interface rápida e intuitiva para você anunciar ou encontrar equipamentos em segundos.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-brand-card/50 border border-brand-border p-8 tactical-panel hover:border-brand-primary/50 transition-colors group"
          >
            <div className="mb-6 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="text-xl font-black text-white uppercase mb-3 tracking-tight">
              {item.title}
            </h3>
            <p className="text-gray-500 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-brand-card to-brand-bg border border-brand-border tactical-panel p-8 md:p-12 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px]" />
            <div className="relative z-10 flex-1 flex flex-col">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
                Como o site <br /> se mantém?
              </h2>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                <p>
                  O Fronteira Airsoft é um <strong>projeto independente</strong>
                  . Não cobramos comissões sobre as suas vendas e não vendemos
                  seus dados.
                </p>
                <p>
                  Nossa infraestrutura, servidores e a equipe dependem da
                  comunidade. Sua doação garante que possamos continuar
                  existindo e evoluindo.
                </p>
              </div>

              <div className="bg-brand-bg/50 border border-brand-border p-6 tactical-panel space-y-6 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/20 tactical-panel-xs flex items-center justify-center text-brand-primary shrink-0">
                    <Coffee size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Apoie o Projeto</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                      Qualquer valor ajuda
                    </p>
                  </div>
                </div>

                <button className="w-full bg-brand-primary hover:bg-brand-primary-light text-black py-4 tactical-panel-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 group text-sm">
                  <Heart
                    size={18}
                    className="group-hover:scale-125 transition-transform"
                  />
                  Doar via PIX
                </button>

                <div className="pt-4 border-t border-brand-border flex items-center justify-around">
                  <div className="text-center">
                    <div className="text-white font-black text-xl">0%</div>
                    <div className="text-[8px] text-gray-500 uppercase font-black">
                      Comissão
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black text-xl">100%</div>
                    <div className="text-[8px] text-gray-500 uppercase font-black">
                      Comunidade
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-card border border-yellow-500/30 tactical-panel p-8 md:p-12 flex flex-col relative overflow-hidden shadow-2xl shadow-yellow-500/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px]" />
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/30 w-fit mb-4">
                <Crown size={12} fill="currentColor" />
                Vantagens Exclusivas
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
                Doador <span className="text-yellow-500">Premium</span>
              </h2>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                <p>
                  A cada <strong>R$ 10,00 doados</strong>, você ganha{" "}
                  <strong>1 semana</strong> de benefícios exclusivos na
                  plataforma:
                </p>
                <ul className="space-y-5 mt-6">
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 mt-0.5">
                      <ArrowUp size={14} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">
                        Prioridade Inteligente
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Destaque nas buscas e desempate em filtros. Seus
                        anúncios aparecem primeiro.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 mt-0.5">
                      <Crown size={14} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">
                        Selo de Destaque
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Badge e bordas douradas nos seus anúncios e no seu
                        perfil de vendedor.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 mt-0.5">
                      <Eye size={14} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">
                        Mais Visibilidade
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Venda seus equipamentos muito mais rápido com o destaque
                        premium.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-auto pt-6 border-t border-yellow-500/20">
                <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 tactical-panel-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 group text-sm">
                  <Crown
                    size={18}
                    fill="currentColor"
                    className="group-hover:scale-125 transition-transform"
                  />
                  Quero ser Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 mb-32">
        <div className="text-center mb-12">
          <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            Mural de Apoiadores
          </h2>
          <p className="text-gray-500 text-sm">
            Nosso muito obrigado a quem faz o Fronteira Airsoft acontecer.
          </p>
        </div>

        <div className="space-y-4 relative">
          <div className="absolute inset-x-0 -bottom-10 h-32 bg-gradient-to-t from-brand-bg to-transparent z-10 pointer-events-none" />

          {loadingDonors ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm italic">
              Seja o primeiro a apoiar o projeto!
            </div>
          ) : (
            donors.map((donor, i) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 md:p-5 tactical-panel-sm border ${donor.is_premium ? "bg-brand-card border-yellow-500/30 shadow-lg shadow-yellow-500/5" : "bg-brand-bg border-brand-border"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={donor.donor_avatar || "https://picsum.photos/seed/" + donor.id + "/200"}
                      alt={donor.donor_name}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 ${donor.is_premium ? "border-yellow-500" : "border-brand-border"}`}
                      referrerPolicy="no-referrer"
                    />
                    {donor.is_premium && (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-brand-card">
                        <Crown
                          size={10}
                          className="text-black"
                          fill="currentColor"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-sm md:text-base">
                        {donor.donor_name}
                      </h4>
                      {donor.is_premium && (
                        <Crown
                          size={14}
                          className="text-yellow-500"
                          fill="currentColor"
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">
                      {donor.is_premium ? "Doador Premium" : "Apoiador"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-black text-lg md:text-xl tracking-tighter ${donor.is_premium ? "text-yellow-500" : "text-brand-primary-light"}`}
                  >
                    R$ {donor.amount.toFixed(2).replace(".", ",")}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 text-center">
        <Users className="mx-auto text-brand-primary mb-6" size={48} />
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
          Junte-se a nós
        </h2>
        <p className="text-gray-500 mb-8">
          O Fronteira Airsoft é mais do que um site de buscas, é o ponto de
          encontro da elite do Airsoft nacional.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-3 bg-brand-card border border-brand-border hover:border-brand-primary text-white tactical-panel-xs font-bold transition-colors">
            Instagram
          </button>
          <button className="px-8 py-3 bg-brand-card border border-brand-border hover:border-brand-primary text-white tactical-panel-xs font-bold transition-colors">
            Discord
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
