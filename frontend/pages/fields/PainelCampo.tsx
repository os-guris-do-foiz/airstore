import React, { useEffect, useState, useCallback } from "react";
import {
  Users, DollarSign, Calendar as CalendarIcon, Clock, Settings, Target, Eye,
  Loader2, Lock, Unlock, Hourglass, ThumbsUp, ThumbsDown, ShieldAlert, Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fieldsApi, eventsApi, Field, FieldEvent } from "../../api/fields";
import { getCurrentUser } from "../../utils/auth";
import { toast } from "../../utils/toast";

const PainelCampo: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.roles?.includes("ADMIN");
  const isOwner = currentUser?.roles?.includes("FIELD_OWNER");

  const [fields, setFields] = useState<Field[]>([]);
  const [eventsByField, setEventsByField] = useState<Record<string, FieldEvent[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const myFields = await fieldsApi.getMine();
      setFields(myFields);
      const entries = await Promise.all(
        myFields.map(async (f) => [f.id, await eventsApi.listByField(f.id)] as const)
      );
      setEventsByField(Object.fromEntries(entries));
    } catch {
      setFields([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (evId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await eventsApi.updateStatus(evId, status);
      toast.success(status === "APPROVED" ? "Partida aprovada! 🎯" : "Partida rejeitada.");
      load();
    } catch (e: any) {
      toast.error(e.message || "Falha ao atualizar a partida.");
    }
  };

  if (!currentUser || (!isOwner && !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldAlert className="text-red-500" size={60} />
        <h2 className="text-2xl font-black text-white uppercase">Acesso Restrito</h2>
        <p className="text-gray-400 max-w-sm">Este painel é exclusivo para Donos de Campo.</p>
        <Link to="/campos" className="text-brand-primary font-bold uppercase text-xs tracking-widest">← Ver campos</Link>
      </div>
    );
  }

  const allEvents = Object.values(eventsByField).flat();
  const pending = allEvents.filter((e) => e.status === "PENDING");
  const approved = allEvents.filter((e) => e.status === "APPROVED");

  const totalPlayers = approved.reduce((s, e) => s + e.players_count, 0);
  const totalRentals = approved.reduce((s, e) => s + e.rentals_count, 0);
  const revenue = approved.reduce((sum, e) => {
    const field = fields.find((f) => f.id === e.field_id);
    if (!field) return sum;
    return (
      sum +
      e.participants.reduce(
        (s, p) => s + (p.needs_rental ? field.base_price + field.rental_price : field.base_price),
        0
      )
    );
  }, 0);

  return (
    <div className="min-h-screen font-sans pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-primary text-black font-black uppercase text-[10px] tracking-widest px-2 py-1 rounded">Painel do Parceiro</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Central de Operações</h1>
          <p className="text-gray-400 mt-2 text-sm">{currentUser.name} • {fields.length} campo(s)</p>
        </div>
        {(isAdmin || isOwner) && (
          <button
            onClick={() => navigate("/campos/novo")}
            className="bg-brand-primary text-black hover:bg-brand-primary-light px-4 py-2 tactical-panel-xs text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Cadastrar Campo
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando painel...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="text-center py-24 space-y-4 border border-dashed border-brand-border tactical-panel">
          <Target className="mx-auto text-brand-border" size={60} />
          <h3 className="text-2xl font-black text-white uppercase">Nenhum campo vinculado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Peça a um Administrador para cadastrar um campo e vincular à sua conta de Dono de Campo.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard icon={<Hourglass size={20} />} color="yellow" label="Pendentes" value={pending.length} />
            <StatCard icon={<Users size={20} />} color="blue" label="Check-ins Previstos" value={totalPlayers} />
            <StatCard icon={<Target size={20} />} color="red" label="Armas para Separar" value={totalRentals} />
            <StatCard icon={<DollarSign size={20} />} color="green" label="Faturamento Estimado" value={`R$ ${revenue}`} />
          </div>

          {pending.length > 0 && (
            <>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <Hourglass className="text-yellow-500" size={20} /> Aguardando sua Confirmação
              </h2>
              <div className="space-y-3 mb-12">
                {pending.map((ev) => (
                  <div key={ev.id} className="bg-brand-card border border-yellow-500/30 tactical-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {ev.visibility === "PRIVATE"
                          ? <span className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Lock size={10} /> Privada</span>
                          : <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Unlock size={10} /> Pública</span>}
                        <span className="text-gray-500 text-[10px] uppercase tracking-widest">• {ev.field_name}</span>
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{ev.title || "Jogo sem nome"}</h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><CalendarIcon size={12} /> {ev.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {ev.start_time}{ev.end_time ? `-${ev.end_time}` : ""}</span>
                        <span>Por {ev.creator_name}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(ev.id, "APPROVED")} className="px-4 py-2.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-black tactical-panel-xs font-black text-[10px] uppercase tracking-widest flex items-center gap-1 border border-brand-green/30 transition-all">
                        <ThumbsUp size={12} /> Aprovar
                      </button>
                      <button onClick={() => handleApprove(ev.id, "REJECTED")} className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white tactical-panel-xs font-black text-[10px] uppercase tracking-widest flex items-center gap-1 border border-red-500/30 transition-all">
                        <ThumbsDown size={12} /> Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {fields.map((field) => {
            const fieldEvents = (eventsByField[field.id] || []).filter((e) => e.status === "APPROVED");
            return (
              <div key={field.id} className="mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">{field.name}</h2>
                  <div className="flex gap-2">
                    <Link to={`/campos/${field.id}`} className="bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-white px-4 py-2 tactical-panel-xs text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                      <Eye size={14} /> Página Pública
                    </Link>
                    <Link to={`/painel-campo/config/${field.id}`} className="bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-white px-4 py-2 tactical-panel-xs text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                      <Settings size={14} /> Ajustes
                    </Link>
                  </div>
                </div>

                {fieldEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm italic border border-dashed border-brand-border tactical-panel-sm">
                    Nenhuma partida confirmada.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fieldEvents.map((ev) => (
                      <div key={ev.id} className="bg-brand-card border border-brand-border tactical-panel p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-center w-24 shrink-0">
                            <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{ev.date}</span>
                            <span className="block font-mono text-xl font-black text-white">{ev.start_time}</span>
                            <span className="block font-mono text-sm text-gray-500">{ev.end_time || ""}</span>
                          </div>
                          <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {ev.visibility === "PRIVATE"
                                ? <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Fechada</span>
                                : <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Aberta</span>}
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">{ev.title || `Jogo de ${ev.creator_name}`}</h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <MiniStat icon={<Users size={12} />} label="Jogadores" value={`${ev.players_count}/${ev.max_players}`} />
                          <MiniStat icon={<Target size={12} />} label="Aluguéis" value={`${ev.rentals_count}`} accent="red" />
                        </div>

                        {ev.participants.length > 0 && (
                          <details className="w-full lg:w-72">
                            <summary className="text-[10px] font-black uppercase tracking-widest text-brand-primary cursor-pointer">Ver lista ({ev.participants.length})</summary>
                            <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                              {ev.participants.map((p) => (
                                <li key={p.id} className="flex items-center justify-between gap-2 text-xs text-gray-400 border-b border-brand-border/50 pb-1">
                                  <span className="truncate flex-1">{p.name}</span>
                                  <span className={p.needs_rental ? "text-red-400" : "text-brand-green"}>{p.needs_rental ? "Aluga" : "Próprio"}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-500/10 text-yellow-500",
  blue: "bg-blue-500/10 text-blue-500",
  red: "bg-red-500/10 text-red-500",
  green: "bg-brand-green/10 text-brand-green",
};

const StatCard: React.FC<{ icon: React.ReactNode; color: string; label: string; value: React.ReactNode }> = ({ icon, color, label, value }) => (
  <div className="bg-brand-card border border-brand-border tactical-panel p-6">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${colorMap[color]}`}>{icon}</div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color === "green" ? "text-brand-green" : "text-white"}`}>{value}</p>
  </div>
);

const MiniStat: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: string }> = ({ icon, label, value, accent }) => (
  <div className="bg-brand-bg tactical-panel-xs p-3 border border-brand-border/50 min-w-[120px]">
    <span className={`block text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1 ${accent === "red" ? "text-red-500" : "text-gray-500"}`}>{icon} {label}</span>
    <span className={`block font-black text-lg ${accent === "red" ? "text-red-400" : "text-white"}`}>{value}</span>
  </div>
);

export default PainelCampo;
