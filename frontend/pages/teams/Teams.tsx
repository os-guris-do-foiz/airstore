import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Shield, Lock, Unlock, Plus, Loader2, X, Star, Crown } from "lucide-react";
import { motion } from "motion/react";
import { teamsApi, Team, MAX_TEAMS } from "../../api/teams";
import ImagePickerField from "../../components/ImagePickerField";
import Pagination from "../../components/Pagination";
import { cover, thumbOf, onThumbError } from "../../utils/img";
import { getCurrentUser, isLoggedIn } from "../../utils/auth";
import { toast } from "../../utils/toast";
import CornerBrackets from "../../components/CornerBrackets";

const Teams: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([
      teamsApi.getAll(page),
      isLoggedIn() ? teamsApi.getMine() : Promise.resolve([]),
    ])
      .then(([all, mine]) => { setTeams(all.items); setTotalPages(all.totalPages); setMyTeams(mine); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    if (currentUser?.id) {
      import("../../api/users").then(({ usersApi }) =>
        usersApi.getProfile(currentUser.id).then((p) => setFeaturedId(p.featured_team?.id || null)).catch(() => {})
      );
    }
  }, []);

  const activeCount = myTeams.filter((t) => t.my_status === "ACTIVE").length;

  const toggleFeatured = async (teamId: string) => {
    const next = featuredId === teamId ? null : teamId;
    try {
      await teamsApi.setFeatured(next);
      setFeaturedId(next);
      toast.success(next ? "Time definido como destaque no perfil." : "Destaque removido.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="py-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block p-4 bg-brand-primary/10 rounded-3xl mb-6">
          <Users size={48} className="text-brand-primary" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
          Times & <span className="text-brand-primary-light">Operadores</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto uppercase font-black tracking-[0.15em] text-xs mb-8">
          Crie ou entre em uma equipe. Participe de até {MAX_TEAMS} times e escolha 1 para exibir no seu perfil.
        </p>
        {isLoggedIn() && (
          <button onClick={() => setCreateOpen(true)} className="tactical-panel-xs inline-flex items-center gap-2 bg-brand-primary text-black hover:bg-brand-primary-light px-6 py-3 font-black uppercase tracking-widest text-xs transition-colors">
            <Plus size={16} /> Criar Time
          </button>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {isLoggedIn() && myTeams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Shield className="text-brand-primary" size={20} /> Meus Times
              </h2>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{activeCount}/{MAX_TEAMS} ativos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map((t) => (
                <div key={t.id} className="tactical-panel-sm bg-brand-card border border-brand-border overflow-hidden">
                  <Link to={`/teams/${t.id}`} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                    <img src={thumbOf(t.avatar || cover([]))} onError={onThumbError(t.avatar || cover([]))} loading="lazy" className="tactical-panel-xs w-12 h-12 object-cover border border-brand-border" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-black truncate">{t.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        {t.my_status === "PENDING" ? "Aguardando aprovação" : `${t.my_role === "ADMIN" ? "Admin" : "Membro"} • ${t.member_count} operadores`}
                      </p>
                    </div>
                  </Link>
                  {t.my_status === "ACTIVE" && (
                    <button
                      onClick={() => toggleFeatured(t.id)}
                      className={`w-full py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors border-t border-brand-border ${featuredId === t.id ? "bg-brand-primary/15 text-brand-primary" : "text-gray-500 hover:text-white"}`}
                    >
                      <Star size={12} fill={featuredId === t.id ? "currentColor" : "none"} />
                      {featuredId === t.id ? "Em destaque no perfil" : "Destacar no perfil"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
            <Users className="text-brand-primary" size={20} /> Todos os Times
          </h2>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-primary" size={36} /></div>
          ) : teams.length === 0 ? (
            <div className="tactical-panel text-center py-16 border border-dashed border-brand-border">
              <Users className="mx-auto text-brand-border mb-3" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Nenhum time criado ainda</p>
              {isLoggedIn() && <p className="text-gray-600 text-xs mt-1">Seja o primeiro a criar!</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  onClick={() => navigate(`/teams/${t.id}`)}
                  className="tactical-panel relative bg-brand-card border border-brand-border overflow-hidden cursor-pointer hover:border-brand-primary/50 transition-colors group"
                >
                  <div className="h-28 relative overflow-hidden bg-brand-bg">
                    {t.banner ? (
                      <img src={thumbOf(t.banner)} onError={onThumbError(t.banner)} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-purple/10" />
                    )}
                    <span className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${t.visibility === "PRIVATE" ? "bg-red-500/80 text-white" : "bg-blue-500/80 text-white"}`}>
                      {t.visibility === "PRIVATE" ? <><Lock size={9} /> Privado</> : <><Unlock size={9} /> Público</>}
                    </span>
                  </div>
                  <div className="px-5 pb-5 -mt-8 relative">
                    <img src={thumbOf(t.avatar || cover([]))} onError={onThumbError(t.avatar || cover([]))} loading="lazy" className="tactical-panel-sm w-16 h-16 object-cover border-4 border-brand-card bg-brand-bg" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mt-2 group-hover:text-brand-primary transition-colors truncate">{t.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 mt-1 min-h-[2rem]">{t.description || "Sem descrição."}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Users size={11} /> {t.member_count} operadores</span>
                      {t.creator_name && <span className="text-[10px] text-gray-600 uppercase tracking-widest flex items-center gap-1"><Crown size={11} className="text-brand-primary" /> {t.creator_name}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
      </div>

      {createOpen && <CreateTeamModal onClose={() => setCreateOpen(false)} onCreated={(id) => { setCreateOpen(false); navigate(`/teams/${id}`); }} />}
    </div>
  );
};

const CreateTeamModal: React.FC<{ onClose: () => void; onCreated: (id: string) => void }> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", description: "", visibility: "PUBLIC" as "PUBLIC" | "PRIVATE" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("description", form.description);
    payload.append("visibility", form.visibility);
    if (avatar) payload.append("avatar", avatar);
    if (banner) payload.append("banner", banner);
    try {
      const t = await teamsApi.create(payload);
      toast.success("Time criado! 🛡️");
      onCreated(t.id);
    } catch (err: any) {
      setError(err.message || "Falha ao criar o time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="tactical-panel bg-brand-card w-full max-w-lg border border-brand-border p-6 md:p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CornerBrackets corners={["tr", "bl"]} size={16} />
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Criar Time</h3>
        {error && <div className="tactical-panel-xs bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Time</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Esquadrão Fantasma" className="tactical-panel-xs w-full bg-brand-bg border border-brand-border p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Descrição</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Estilo de jogo, base, objetivo..." className="tactical-panel-xs w-full bg-brand-bg border border-brand-border p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ImagePickerField label="Logo / Foto" file={avatar} onChange={setAvatar} sizeClass="aspect-square" />
            <ImagePickerField label="Banner" file={banner} onChange={setBanner} sizeClass="aspect-square" className="col-span-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({ ...form, visibility: "PUBLIC" })} className={`tactical-panel-xs p-4 text-left border transition-all ${form.visibility === "PUBLIC" ? "bg-blue-500/10 border-blue-500" : "bg-brand-bg border-brand-border"}`}>
              <Unlock size={18} className="text-blue-400 mb-1" />
              <p className="text-blue-400 font-black uppercase text-xs">Público</p>
              <p className="text-gray-500 text-[10px]">Qualquer um entra.</p>
            </button>
            <button type="button" onClick={() => setForm({ ...form, visibility: "PRIVATE" })} className={`tactical-panel-xs p-4 text-left border transition-all ${form.visibility === "PRIVATE" ? "bg-red-500/10 border-red-500" : "bg-brand-bg border-brand-border"}`}>
              <Lock size={18} className="text-red-400 mb-1" />
              <p className="text-red-400 font-black uppercase text-xs">Privado</p>
              <p className="text-gray-500 text-[10px]">Entra só com aprovação.</p>
            </button>
          </div>
          <button type="submit" disabled={loading} className="tactical-panel-xs w-full bg-brand-primary text-black hover:bg-brand-primary-light py-3.5 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={16} /> Criar Time</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Teams;
