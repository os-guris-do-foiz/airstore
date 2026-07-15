import React, { useEffect, useState } from "react";
import { MapPin, Target, Calendar, ArrowRight, Loader2, Plus, MapPinned } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { fieldsApi, Field } from "../../api/fields";
import { cover, thumbOf, onThumbError } from "../../utils/img";
import { hasRole } from "../../utils/auth";
import CornerBrackets from "../../components/CornerBrackets";
import Pagination from "../../components/Pagination";

const Campos: React.FC = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const isAdmin = hasRole("ADMIN");
  const canCreate = isAdmin || hasRole("FIELD_OWNER");

  useEffect(() => {
    setLoading(true);
    fieldsApi
      .getAll({ page })
      .then((data) => { setFields(data.items); setTotalPages(data.totalPages); })
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen pb-20 font-sans">
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1574391696081-30062bc466bd?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="Campos Hero" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/60 via-brand-bg/80 to-brand-bg rounded-b-full"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6"
          >
            <span className="text-brand-primary-light font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
               <Target size={14} /> Circuito Nacional
            </span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Escolha seu <span className="text-brand-primary-light">Campo</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto uppercase font-bold tracking-[0.1em] text-sm md:text-base leading-relaxed">
            Navegue pelos melhores campos. Reserve partidas públicas, privadas ou junte-se a missões existentes na semana.
          </p>

          {canCreate && (
            <button
              onClick={() => navigate("/campos/novo")}
              className="tactical-panel-xs mt-8 inline-flex items-center gap-2 bg-brand-primary text-black hover:bg-brand-primary-light px-6 py-3 font-black uppercase tracking-widest text-xs transition-colors"
            >
              <Plus size={16} /> Cadastrar Campo
            </button>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando campos...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="tactical-panel text-center py-24 space-y-4 border border-dashed border-brand-border">
            <MapPinned className="mx-auto text-brand-border" size={60} />
            <h3 className="text-2xl font-black text-white uppercase">Nenhum campo cadastrado</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isAdmin
                ? "Cadastre o primeiro campo e vincule-o a um Dono de Campo."
                : "Ainda não há campos cadastrados. Volte em breve."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fields.map((campo) => (
              <motion.div
                key={campo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/campos/${campo.id}`)}
                className="tactical-panel relative bg-brand-card border border-brand-border overflow-hidden flex flex-col group cursor-pointer hover:border-brand-primary/50 transition-colors shadow-xl"
              >
                <CornerBrackets corners={["tr", "bl"]} size={14} inset={2} />
                <div className="h-56 relative overflow-hidden">
                  <img src={thumbOf(campo.cover || cover(campo.images))} onError={onThumbError(campo.cover || cover(campo.images))} alt={campo.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent"></div>
                  {campo.type && (
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <div className="tactical-panel-xs bg-brand-primary text-black font-black uppercase text-[10px] tracking-widest px-3 py-1.5">
                        {campo.type}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">{campo.name}</h2>
                    <div className="text-brand-green font-black tracking-tight text-lg">
                      R$ {campo.base_price} <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">/ Operador (Próprio)</span>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-6 leading-relaxed text-sm line-clamp-3 flex-grow">
                    {campo.description}
                  </p>

                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <MapPin size={14} className="text-brand-primary" />
                      <span className="truncate">{campo.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <Calendar size={14} className="text-brand-primary" />
                      <span>Veja a agenda de operações</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-brand-border flex justify-between items-center group-hover:border-white/10 transition-colors">
                    <span className="font-black text-xs uppercase tracking-widest text-brand-primary-light">
                      Ver Agendas
                    </span>
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary text-brand-primary group-hover:text-black transition-all">
                       <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>
    </div>
  );
};

export default Campos;
