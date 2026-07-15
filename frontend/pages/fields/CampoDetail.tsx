import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  MapPin, ShieldAlert, CheckCircle2, ChevronLeft,
  Clock, Users, Lock, Unlock, Copy, Check, Home, X,
  Flag, Plus, Loader2, Calendar as CalendarIcon, Target,
  ThumbsUp, ThumbsDown, Hourglass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReportModal from "../../components/modals/ReportModal";
import { fieldsApi, eventsApi, Field, FieldEvent } from "../../api/fields";
import { usersApi, AppUser } from "../../api/users";
import { cover, onImgError } from "../../utils/img";
import { getCurrentUser, isLoggedIn } from "../../utils/auth";
import { toast } from "../../utils/toast";
import { Store, UserPlus, Trash2, Settings, ListChecks } from "lucide-react";
import CornerBrackets from "../../components/CornerBrackets";

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
};

const CampoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const currentUser = getCurrentUser();

  const [field, setField] = useState<Field | null>(null);
  const [events, setEvents] = useState<FieldEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const [joinTarget, setJoinTarget] = useState<FieldEvent | null>(null);
  const [inviteToken, setInviteToken] = useState<string | undefined>(undefined);

  const [listTarget, setListTarget] = useState<FieldEvent | null>(null);

  const isAdmin = !!currentUser?.roles?.includes("ADMIN");
  const isOwnerOfField = !!field && !!currentUser && field.owner_ids.includes(currentUser.id);
  const canManage = isAdmin || isOwnerOfField;

  const loadEvents = useCallback(() => {
    if (!id) return;
    eventsApi.listByField(id).then(setEvents).catch(() => setEvents([]));
  }, [id]);

  const loadField = useCallback(() => {
    if (!id) return Promise.resolve();
    return fieldsApi.getById(id).then(setField).catch(() => setField(null));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    loadField().finally(() => setLoading(false));
    loadEvents();
  }, [id, loadField, loadEvents]);

  useEffect(() => {
    const eventId = searchParams.get("event");
    const token = searchParams.get("invite") || undefined;
    if (!eventId) return;
    eventsApi
      .getById(eventId)
      .then((ev) => {
        setInviteToken(token);
        setJoinTarget(ev);
      })
      .catch(() => {});
  }, [searchParams]);

  const handleApprove = async (ev: FieldEvent, status: "APPROVED" | "REJECTED") => {
    try {
      await eventsApi.updateStatus(ev.id, status);
      toast.success(status === "APPROVED" ? "Partida aprovada! 🎯" : "Partida rejeitada.");
      loadEvents();
    } catch (e: any) {
      toast.error(e.message || "Falha ao atualizar a partida.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando campo...</p>
      </div>
    );
  }

  if (!field) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Target className="text-brand-border" size={60} />
        <h2 className="text-2xl font-black text-white uppercase">Campo não encontrado</h2>
        <Link to="/campos" className="text-brand-primary font-bold uppercase text-xs tracking-widest">← Voltar aos campos</Link>
      </div>
    );
  }

  const byDate: Record<string, FieldEvent[]> = {};
  events.forEach((e) => {
    (byDate[e.date] = byDate[e.date] || []).push(e);
  });
  const sortedDates = Object.keys(byDate).sort();

  return (
    <div className="min-h-screen font-sans pb-20">
      <section className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0">
          <img src={field.cover || cover(field.images)} onError={onImgError} alt={field.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent"></div>
        </div>

        <div className="absolute top-8 left-4 md:left-8 z-10 flex gap-2">
          <Link to="/campos" className="bg-black/50 hover:bg-brand-primary text-white hover:text-black backdrop-blur-md p-3 tactical-panel-xs transition-all border border-white/10 group">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {canManage && (
          <div className="absolute top-8 right-4 md:right-8 z-10">
            <Link
              to={`/painel-campo/config/${field.id}`}
              className="bg-black/50 hover:bg-brand-primary text-white hover:text-black backdrop-blur-md px-4 py-3 tactical-panel-xs transition-all border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <Settings size={16} /> Editar Campo
            </Link>
          </div>
        )}

        <div className="absolute bottom-0 w-full z-10 pb-12 pt-20 px-4 md:px-8 max-w-7xl mx-auto left-0 right-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {field.type && (
              <span className="bg-brand-primary text-black font-black uppercase text-xs tracking-widest px-3 py-1 tactical-panel-xs">
                {field.type}
              </span>
            )}
            {field.owner_names.length > 0 && (
              <span className="bg-black/40 border border-white/10 text-gray-300 font-bold uppercase text-xs tracking-widest px-3 py-1 tactical-panel-xs">
                {field.owner_names.length > 1 ? "Parceiros" : "Parceiro"}: {field.owner_names.join(", ")}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            {field.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-300 font-bold uppercase text-xs tracking-widest">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-primary" />
              {field.location}
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-brand-primary" />
              R$ {field.base_price} (Próprio) / R$ {field.base_price + field.rental_price} (Locação)
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors uppercase"
            >
              <Flag size={14} /> Denunciar Campo
            </button>
          </div>
        </div>
      </section>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={field.id}
        type="FIELD"
        title={field.name}
      />

      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-brand-card tactical-panel relative p-6 md:p-10 border border-brand-border">
            <CornerBrackets corners={["tr", "bl"]} size={16} />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Visão Geral</h2>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base whitespace-pre-line">{field.description}</p>
          </div>

          {isAdmin && <OwnerManager field={field} onChange={loadField} />}

          {(field.rules.length > 0 || field.infrastructure.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {field.rules.length > 0 && (
                <div className="bg-brand-card tactical-panel p-6 md:p-8 border border-brand-border">
                  <h3 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight mb-6">
                    <ShieldAlert className="text-red-500" /> Regras do Campo
                  </h3>
                  <ul className="space-y-4">
                    {field.rules.map((rule, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-400">
                        <span className="text-brand-primary mt-0.5">•</span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {field.infrastructure.length > 0 && (
                <div className="bg-brand-card tactical-panel p-6 md:p-8 border border-brand-border">
                  <h3 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight mb-6">
                    <Home className="text-brand-primary" /> Infraestrutura
                  </h3>
                  <ul className="space-y-4">
                    {field.infrastructure.map((infra, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-400">
                        <CheckCircle2 size={16} className="text-brand-green shrink-0" />
                        <span>{infra}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-brand-card tactical-panel relative border border-brand-border p-6 sticky top-24 shadow-2xl">
            <CornerBrackets corners={["tr", "bl"]} size={16} />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <CalendarIcon className="text-brand-primary" />
                Timeline
              </h2>
              {isLoggedIn() && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="bg-brand-primary text-black hover:bg-brand-primary-light px-3 py-2 tactical-panel-xs text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Criar
                </button>
              )}
            </div>

            {sortedDates.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm italic border border-dashed border-brand-border tactical-panel-xs px-4">
                Nenhuma partida agendada.
                {isLoggedIn() ? " Crie a primeira!" : " Faça login para criar uma."}
              </div>
            ) : (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-brand-card py-1 z-10">
                      <span className="text-[11px] font-black uppercase tracking-widest text-brand-primary-light capitalize">
                        {fmtDate(date)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {byDate[date].map((ev) => (
                        <EventCard
                          key={ev.id}
                          ev={ev}
                          canApprove={isOwnerOfField}
                          onJoin={() => { setInviteToken(ev.invite_token); setJoinTarget(ev); }}
                          onApprove={handleApprove}
                          onOpenList={() => setListTarget(ev)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {createOpen && (
        <CreateEventModal
          field={field}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); loadEvents(); }}
        />
      )}

      {joinTarget && (
        <JoinEventModal
          field={field}
          event={joinTarget}
          inviteToken={inviteToken}
          defaultName={currentUser?.name || ""}
          onClose={() => setJoinTarget(null)}
          onJoined={() => { setJoinTarget(null); loadEvents(); }}
        />
      )}

      {listTarget && (
        <ParticipantListModal
          event={listTarget}
          currentUserId={currentUser?.id}
          onClose={() => setListTarget(null)}
          onChanged={loadEvents}
        />
      )}
    </div>
  );
};

const EventCard: React.FC<{
  ev: FieldEvent;
  canApprove: boolean;
  onJoin: () => void;
  onApprove: (ev: FieldEvent, status: "APPROVED" | "REJECTED") => void;
  onOpenList: () => void;
}> = ({ ev, canApprove, onJoin, onApprove, onOpenList }) => {
  const isPrivate = ev.visibility === "PRIVATE";
  const isFull = ev.players_count >= ev.max_players;
  const isApproved = ev.status === "APPROVED";

  return (
    <div className="bg-brand-bg tactical-panel-sm p-4 border border-brand-border">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-brand-primary" />
          <span className="font-mono text-white font-bold">
            {ev.start_time}{ev.end_time ? ` - ${ev.end_time}` : ""}
          </span>
        </div>
        <div className="text-xs uppercase font-black tracking-widest">
          {isPrivate ? (
            <span className="text-red-400 flex items-center gap-1"><Lock size={12} /> Privada</span>
          ) : (
            <span className="text-blue-400 flex items-center gap-1"><Unlock size={12} /> Pública</span>
          )}
        </div>
      </div>

      {ev.title && <p className="text-sm font-bold text-white mb-1">{ev.title}</p>}
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
        Por {ev.creator_name || "—"}
      </p>

      <div className="flex justify-between items-center mb-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1"><Users size={12} /> {ev.players_count}/{ev.max_players}</span>
        <span className="flex items-center gap-1 text-red-400"><Target size={12} /> {ev.rentals_count} aluguéis</span>
      </div>

      {ev.status === "PENDING" && (
        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-1">
            <Hourglass size={12} /> Aguardando confirmação do dono
          </span>
        </div>
      )}
      {ev.status === "REJECTED" && (
        <div className="mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Rejeitada pelo dono</span>
        </div>
      )}

      {canApprove && ev.status === "PENDING" ? (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(ev, "APPROVED")}
            className="flex-1 py-2.5 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-black tactical-panel-xs font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 transition-all border border-brand-green/30"
          >
            <ThumbsUp size={12} /> Aprovar
          </button>
          <button
            onClick={() => onApprove(ev, "REJECTED")}
            className="flex-1 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white tactical-panel-xs font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 transition-all border border-red-500/30"
          >
            <ThumbsDown size={12} /> Rejeitar
          </button>
        </div>
      ) : isApproved && isPrivate ? (
        <button disabled className="w-full py-3 bg-red-500/10 text-red-500/60 tactical-panel-xs font-bold text-xs uppercase tracking-widest border border-red-500/20 cursor-not-allowed flex items-center justify-center gap-2">
          <Lock size={14} /> Somente por Convite
        </button>
      ) : isApproved ? (
        <button
          onClick={onJoin}
          disabled={isFull}
          className={`w-full py-3 tactical-panel-xs font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            isFull
              ? "bg-brand-border text-gray-500 cursor-not-allowed"
              : "bg-brand-primary text-black hover:bg-brand-primary-light shadow-lg shadow-white/5"
          }`}
        >
          {isFull ? "Lotado" : "Entrar na Lista"}
        </button>
      ) : null}

      {isApproved && (
        <button
          onClick={onOpenList}
          className="mt-2 w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-primary border border-brand-border hover:border-brand-primary/40 tactical-panel-xs transition-colors flex items-center justify-center gap-1"
        >
          <ListChecks size={12} /> Ver Lista ({ev.players_count})
        </button>
      )}
    </div>
  );
};

const ParticipantListModal: React.FC<{
  event: FieldEvent;
  currentUserId?: string;
  onClose: () => void;
  onChanged: () => void;
}> = ({ event, currentUserId, onClose, onChanged }) => {
  const [participants, setParticipants] = useState(event.participants);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rentals = participants.filter((p) => p.needs_rental).length;

  const remove = async (pid: string) => {
    setRemovingId(pid);
    setError(null);
    try {
      await eventsApi.leave(event.id, pid);
      setParticipants((prev) => prev.filter((p) => p.id !== pid));
      toast.success("Você saiu da lista.");
      onChanged();
    } catch (e: any) {
      setError(e.message || "Falha ao sair da lista.");
      toast.error(e.message || "Falha ao sair da lista.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-card w-full max-w-md tactical-panel border border-brand-border p-6 md:p-8 relative z-10 shadow-2xl max-h-[85vh] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="mb-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1 flex items-center gap-2">
            <ListChecks className="text-brand-primary" /> Lista de Operadores
          </h3>
          <p className="text-gray-400 text-xs font-mono text-brand-primary-light">
            {event.title ? `${event.title} • ` : ""}{event.start_time}{event.end_time ? ` - ${event.end_time}` : ""}
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-brand-bg border border-brand-border tactical-panel-xs p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Confirmados</p>
            <p className="text-xl font-black text-white">{participants.length}/{event.max_players}</p>
          </div>
          <div className="flex-1 bg-brand-bg border border-brand-border tactical-panel-xs p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Aluguéis</p>
            <p className="text-xl font-black text-red-400">{rentals}</p>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-3 mb-3">{error}</div>}

        <div className="overflow-y-auto -mx-2 px-2 space-y-2">
          {participants.length === 0 ? (
            <p className="text-center py-8 text-gray-600 italic text-sm">Lista vazia. Seja o primeiro!</p>
          ) : (
            participants.map((p, i) => {
              const canRemove = !!currentUserId && p.user_id === currentUserId;
              return (
                <div key={p.id} className="flex items-center gap-3 bg-brand-bg border border-brand-border tactical-panel-xs p-3">
                  <span className="w-6 text-center text-xs font-black text-gray-600">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{p.name}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.needs_rental ? "text-red-400" : "text-brand-green"}`}>
                      {p.needs_rental ? "Vai alugar" : "Equip. próprio"}
                    </span>
                  </div>
                  {canRemove && (
                    <button
                      onClick={() => remove(p.id)}
                      disabled={removingId === p.id}
                      className="text-red-400 hover:bg-red-500 hover:text-white p-2 tactical-panel-xs transition-all disabled:opacity-40 shrink-0"
                      title="Sair da lista"
                    >
                      {removingId === p.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

const CreateEventModal: React.FC<{
  field: Field;
  onClose: () => void;
  onCreated: () => void;
}> = ({ field, onClose, onCreated }) => {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    date: today,
    start_time: "08:00",
    end_time: "12:00",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    max_players: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; token?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const ev = await eventsApi.create(field.id, {
        ...form,
        max_players: Number(form.max_players),
      });
      setCreated({ id: ev.id, token: ev.invite_token });
      toast.success("Partida enviada! Aguardando aprovação do dono.");
    } catch (err: any) {
      setError(err.message || "Falha ao criar a partida.");
    } finally {
      setLoading(false);
    }
  };

  const inviteLink = created
    ? `${window.location.origin}/campos/${field.id}?event=${created.id}${created.token ? `&invite=${created.token}` : ""}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-card w-full max-w-xl tactical-panel border border-brand-border p-6 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {!created ? (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Nova Partida</h3>
              <p className="text-gray-400 text-sm">Sua lista passará por confirmação do dono do campo antes de ficar pública.</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-3">{error}</div>}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da operação (opcional)</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Operação Tempestade"
                  className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Data</label>
                  <input
                    type="date" required value={form.date} min={today}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white focus:border-brand-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vagas</label>
                  <input
                    type="number" required min={1} value={form.max_players}
                    onChange={(e) => setForm({ ...form, max_players: Number(e.target.value) })}
                    className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Início</label>
                  <input
                    type="time" required value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white focus:border-brand-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fim</label>
                  <input
                    type="time" value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, visibility: "PUBLIC" })}
                  className={`tactical-panel-sm p-5 text-left border transition-all ${form.visibility === "PUBLIC" ? "bg-blue-500/10 border-blue-500" : "bg-brand-bg border-brand-border"}`}
                >
                  <Unlock size={20} className="text-blue-400 mb-2" />
                  <h4 className="text-blue-400 font-black uppercase text-sm">Pública</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-1">Qualquer operador pode entrar.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, visibility: "PRIVATE" })}
                  className={`tactical-panel-sm p-5 text-left border transition-all ${form.visibility === "PRIVATE" ? "bg-red-500/10 border-red-500" : "bg-brand-bg border-brand-border"}`}
                >
                  <Lock size={20} className="text-red-400 mb-2" />
                  <h4 className="text-red-400 font-black uppercase text-sm">Privada</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-1">Só entra quem tiver o link de convite.</p>
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-primary text-black hover:bg-brand-primary-light transition-all tactical-panel-xs py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={16} /> Criar Partida</>}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <Hourglass size={36} className="text-yellow-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Partida Enviada!</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                Aguardando confirmação do dono do campo. Assim que aprovada, ela aparece na timeline.
              </p>
            </div>

            {created.token && (
              <div className="bg-brand-bg border border-brand-border tactical-panel-sm p-5 text-left">
                <p className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-red-400" /> Link de Convite (Privada)
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black border border-brand-border tactical-panel-xs p-3 overflow-x-auto">
                    <code className="text-gray-300 font-mono text-[11px] whitespace-nowrap">{inviteLink}</code>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="bg-brand-primary text-black px-5 tactical-panel-xs hover:bg-brand-primary-light transition-colors flex items-center justify-center"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            )}

            <button onClick={onCreated} className="w-full bg-transparent border border-brand-border text-white hover:bg-white/5 transition-all tactical-panel-xs py-4 font-black uppercase tracking-widest">
              Fechar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const JoinEventModal: React.FC<{
  field: Field;
  event: FieldEvent;
  inviteToken?: string;
  defaultName: string;
  onClose: () => void;
  onJoined: () => void;
}> = ({ field, event, inviteToken, defaultName, onClose, onJoined }) => {
  const [name, setName] = useState(defaultName);
  const [needsRental, setNeedsRental] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await eventsApi.join(event.id, { name: name.trim(), needs_rental: needsRental, invite_token: inviteToken });
      setDone(true);
      toast.success("Você entrou na lista! 🎯");
    } catch (err: any) {
      setError(err.message || "Falha ao entrar na lista.");
    } finally {
      setLoading(false);
    }
  };

  const price = needsRental ? field.base_price + field.rental_price : field.base_price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-card w-full max-w-md tactical-panel border border-brand-border p-6 md:p-10 relative z-10 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {done ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-brand-green" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Você está na lista!</h3>
              <p className="text-gray-400 text-sm">Seu lugar na operação está garantido.</p>
            </div>
            <button onClick={onJoined} className="w-full bg-brand-primary text-black hover:bg-brand-primary-light tactical-panel-xs py-4 font-black uppercase tracking-widest transition-all">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                {event.visibility === "PRIVATE" ? "Reserva Privada" : "Alistamento"}
              </h3>
              <p className="text-gray-400 text-sm font-mono text-brand-primary-light">
                {event.title ? `${event.title} • ` : ""}{event.start_time}{event.end_time ? ` - ${event.end_time}` : ""}
              </p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-3">{error}</div>}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seu Nome / Callsign</label>
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ghost, Capitão Price..."
                className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Equipamento</label>
              <select
                value={needsRental ? "yes" : "no"}
                onChange={(e) => setNeedsRental(e.target.value === "yes")}
                className="w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white focus:border-brand-primary outline-none appearance-none"
              >
                <option value="no">Tenho airsoft próprio — R$ {field.base_price}</option>
                <option value="yes">Vou alugar arma + máscara — R$ {field.base_price + field.rental_price}</option>
              </select>
            </div>

            <div className="bg-brand-bg border border-brand-border tactical-panel-xs p-4 flex justify-between text-sm font-bold uppercase tracking-widest text-gray-400">
              <span>Valor Individual:</span>
              <span className="text-brand-green">R$ {price}</span>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-primary text-black hover:bg-brand-primary-light tactical-panel-xs py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Confirmar <Check size={16} /></>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const OwnerManager: React.FC<{ field: Field; onChange: () => Promise<void> | void }> = ({ field, onChange }) => {
  const [candidates, setCandidates] = useState<AppUser[]>([]);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .getAll({ limit: 100 })
      .then((all) => setCandidates(all.items.filter((u) => (u.roles || []).includes("FIELD_OWNER"))))
      .catch(() => setCandidates([]));
  }, []);

  const saveOwners = async (ownerIds: string[]) => {
    setSaving(true);
    setError(null);
    try {
      await fieldsApi.update(field.id, { owner_ids: ownerIds } as any);
      await onChange();
      toast.success("Donos do campo atualizados.");
    } catch (e: any) {
      setError(e.message || "Falha ao atualizar donos.");
      toast.error(e.message || "Falha ao atualizar donos.");
    } finally {
      setSaving(false);
    }
  };

  const addOwner = () => {
    if (!selected || field.owner_ids.includes(selected)) return;
    saveOwners([...field.owner_ids, selected]);
    setSelected("");
  };

  const removeOwner = (id: string) => saveOwners(field.owner_ids.filter((o) => o !== id));

  const available = candidates.filter((u) => !field.owner_ids.includes(u.id));

  return (
    <div className="bg-brand-card tactical-panel p-6 md:p-8 border border-brand-primary/30">
      <h3 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight mb-2">
        <Store className="text-brand-primary" /> Donos do Campo
        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-black tracking-widest">ADMIN</span>
      </h3>
      <p className="text-gray-500 text-xs mb-6">Adicione um ou vários donos, ou deixe o campo sem dono.</p>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-3 mb-4">{error}</div>}

      <div className="space-y-2 mb-6">
        {field.owners.length === 0 ? (
          <p className="text-gray-600 italic text-sm border border-dashed border-brand-border tactical-panel-xs p-4 text-center">
            Nenhum dono vinculado (campo sem dono).
          </p>
        ) : (
          field.owners.map((o) => (
            <div key={o.id} className="flex items-center justify-between bg-brand-bg border border-brand-border tactical-panel-xs p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black">
                  {(o.name || "?").charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{o.name}</p>
                  {o.email && <p className="text-[10px] text-gray-500 uppercase tracking-widest">{o.email}</p>}
                </div>
              </div>
              <button
                onClick={() => removeOwner(o.id)}
                disabled={saving}
                className="text-red-400 hover:bg-red-500 hover:text-white p-2 tactical-panel-xs transition-all disabled:opacity-40"
                title="Remover dono"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={saving || available.length === 0}
          className="flex-1 bg-brand-bg border border-brand-border tactical-panel-xs p-3 text-white focus:border-brand-primary outline-none appearance-none disabled:opacity-50"
        >
          <option value="">{available.length === 0 ? "Nenhum dono disponível" : "Selecione um dono para adicionar..."}</option>
          {available.map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
        <button
          onClick={addOwner}
          disabled={saving || !selected}
          className="bg-brand-primary text-black hover:bg-brand-primary-light px-5 tactical-panel-xs font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-colors disabled:opacity-40"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <><UserPlus size={16} /> Add</>}
        </button>
      </div>
      {candidates.length === 0 && (
        <p className="text-[11px] text-gray-500 mt-2">Nenhum usuário com cargo "Dono de Campo". Atribua o cargo no Painel Admin.</p>
      )}
    </div>
  );
};

export default CampoDetail;
