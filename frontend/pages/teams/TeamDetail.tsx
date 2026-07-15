import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users, Lock, Unlock, ChevronLeft, Crown, Shield, Loader2, LogOut, UserPlus,
  Settings, Trash2, Check, X, Megaphone, Copy, ThumbsUp, ThumbsDown, Star, Pencil
} from "lucide-react";
import { motion } from "motion/react";
import { teamsApi, Team, TeamMember } from "../../api/teams";
import ImagePickerField from "../../components/ImagePickerField";
import { cover, onImgError } from "../../utils/img";
import { getCurrentUser, isLoggedIn } from "../../utils/auth";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";
import CornerBrackets from "../../components/CornerBrackets";

const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    return teamsApi.getById(id).then(setTeam).catch(() => setTeam(null));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load()?.finally(() => setLoading(false));
  }, [load]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;
  if (!team) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <Users className="text-brand-border" size={60} />
      <h2 className="text-2xl font-black text-white uppercase">Time não encontrado</h2>
      <Link to="/teams" className="text-brand-primary font-bold uppercase text-xs tracking-widest">← Voltar aos times</Link>
    </div>
  );

  const myMembership = team.members.find((m) => m.user_id === currentUser?.id) || null;
  const isSiteAdmin = !!currentUser?.roles?.includes("ADMIN");
  const isTeamAdmin = (myMembership?.role === "ADMIN" && myMembership?.status === "ACTIVE") || isSiteAdmin;
  const isActiveMember = myMembership?.status === "ACTIVE";
  const isPending = myMembership?.status === "PENDING";
  const isCreator = team.creator_id === currentUser?.id;

  const active = team.members.filter((m) => m.status === "ACTIVE");
  const pending = team.members.filter((m) => m.status === "PENDING");

  const doJoin = async () => {
    setBusy(true);
    try {
      const res = await teamsApi.join(team.id);
      toast.success(res.pending ? "Solicitação enviada! Aguarde a aprovação." : "Você entrou no time! 🛡️");
      await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const doLeave = async () => {
    if (!myMembership) return;
    if (!(await confirmDialog({
      title: isPending ? "Cancelar solicitação" : "Sair do time",
      message: isPending ? "Deseja cancelar sua solicitação para entrar neste time?" : "Tem certeza que deseja sair deste time?",
      confirmText: isPending ? "Cancelar solicitação" : "Sair",
      danger: true,
    }))) return;
    setBusy(true);
    try {
      await teamsApi.removeMember(team.id, myMembership.id);
      toast.success(isPending ? "Solicitação cancelada." : "Você saiu do time.");
      await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const approve = async (m: TeamMember) => {
    try { await teamsApi.approveMember(team.id, m.id); toast.success(`${m.user?.name} aprovado!`); await load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const kick = async (m: TeamMember, reject = false) => {
    if (!reject && !(await confirmDialog({ title: "Remover membro", message: `Remover ${m.user?.name} do time?`, confirmText: "Remover", danger: true }))) return;
    try { await teamsApi.removeMember(team.id, m.id); toast.success(reject ? "Solicitação recusada." : "Membro removido."); await load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const toggleRole = async (m: TeamMember) => {
    const next = m.role === "ADMIN" ? "MEMBER" : "ADMIN";
    try { await teamsApi.setMemberRole(team.id, m.id, next); toast.success("Cargo atualizado."); await load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const doDelete = async () => {
    if (!(await confirmDialog({ title: "Excluir time", message: "Excluir o time definitivamente? Todos os membros serão removidos e esta ação não pode ser desfeita.", confirmText: "Excluir", danger: true }))) return;
    try { await teamsApi.delete(team.id); toast.success("Time excluído."); navigate("/teams"); }
    catch (e: any) { toast.error(e.message); }
  };

  const doDeleteAnn = async () => {
    if (!(await confirmDialog({ title: "Apagar anúncio", message: "Apagar o anúncio do time?", confirmText: "Apagar", danger: true }))) return;
    try { await teamsApi.deleteAnnouncement(team.id); toast.success("Anúncio apagado."); await load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const inviteLink = team.invite_token ? `${window.location.origin}/teams/${team.id}` : "";
  const ann = team.announcement;
  const annDaysLeft = ann ? Math.max(0, Math.ceil((new Date(ann.expires_at).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="relative h-48 md:h-64 w-full overflow-hidden bg-brand-bg">
        {team.banner ? (
          <img src={team.banner} onError={onImgError} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/15 to-brand-purple/15" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
        <Link to="/teams" className="absolute top-6 left-4 md:left-8 bg-black/50 hover:bg-brand-primary text-white hover:text-black backdrop-blur-md p-3 tactical-panel-xs transition-all border border-white/10">
          <ChevronLeft size={22} />
        </Link>
        {isTeamAdmin && (
          <button onClick={() => setEditOpen(true)} className="absolute top-6 right-4 md:right-8 bg-black/50 hover:bg-brand-primary text-white hover:text-black backdrop-blur-md px-4 py-3 tactical-panel-xs transition-all border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Settings size={16} /> Editar
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-5 mb-8">
          <img src={team.avatar || cover([])} onError={onImgError} className="w-28 h-28 tactical-panel object-cover border-4 border-brand-bg bg-brand-card shadow-2xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${team.visibility === "PRIVATE" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                {team.visibility === "PRIVATE" ? <><Lock size={9} /> Privado</> : <><Unlock size={9} /> Público</>}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Users size={11} /> {active.length} operadores</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{team.name}</h1>
            {team.creator_name && (
              <p className="text-[11px] text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                <Crown size={12} className="text-brand-primary" /> Criado por {team.creator_name}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {!isLoggedIn() ? null : isActiveMember ? (
              <button onClick={doLeave} disabled={busy} className="flex items-center gap-2 bg-brand-card border border-brand-border hover:border-red-500 hover:text-red-400 text-gray-300 px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                <LogOut size={16} /> Sair
              </button>
            ) : isPending ? (
              <button onClick={doLeave} disabled={busy} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest">
                Pendente • Cancelar
              </button>
            ) : (
              <button onClick={doJoin} disabled={busy} className="flex items-center gap-2 bg-brand-primary text-black hover:bg-brand-primary-light px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                {busy ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                {team.visibility === "PRIVATE" ? "Solicitar Entrada" : "Entrar"}
              </button>
            )}
          </div>
        </div>

        {ann ? (
          <div className="relative bg-gradient-to-br from-brand-primary/10 to-brand-purple/10 border border-brand-primary/30 tactical-panel-sm overflow-hidden mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row">
              {ann.image && (
                <div className="sm:w-56 h-44 sm:h-auto shrink-0 overflow-hidden">
                  <img src={ann.image} onError={onImgError} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-brand-primary text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                    <Megaphone size={10} /> Anúncio
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Expira em {annDaysLeft} {annDaysLeft === 1 ? "dia" : "dias"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 break-words">{ann.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line break-words">{ann.description}</p>
                {isTeamAdmin && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setAnnOpen(true)} className="flex items-center gap-1.5 bg-brand-bg border border-brand-border hover:border-brand-primary text-gray-300 hover:text-brand-primary px-3 py-2 tactical-panel-xs text-[10px] font-black uppercase tracking-widest transition-colors">
                      <Pencil size={13} /> Editar
                    </button>
                    <button onClick={doDeleteAnn} className="flex items-center gap-1.5 bg-brand-bg border border-brand-border hover:border-red-500 text-gray-300 hover:text-red-400 px-3 py-2 tactical-panel-xs text-[10px] font-black uppercase tracking-widest transition-colors">
                      <Trash2 size={13} /> Apagar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : isTeamAdmin ? (
          <button
            onClick={() => setAnnOpen(true)}
            className="w-full mb-6 border-2 border-dashed border-brand-border hover:border-brand-primary/50 tactical-panel-sm p-5 flex items-center justify-center gap-2 text-gray-500 hover:text-brand-primary transition-colors text-xs font-black uppercase tracking-widest"
          >
            <Megaphone size={16} /> Criar anúncio do time
          </button>
        ) : null}

        {team.description && (
          <div className="bg-brand-card border border-brand-border tactical-panel-sm p-6 mb-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{team.description}</p>
          </div>
        )}

        {team.notice && (
          <div className="bg-brand-primary/5 border border-brand-primary/25 tactical-panel-sm p-5 mb-6">
            <div className="flex items-center gap-2 mb-2 text-brand-primary font-black uppercase text-xs tracking-widest">
              <Megaphone size={16} /> Mural do Time
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-line break-words">{team.notice}</p>
          </div>
        )}

        {isTeamAdmin && team.visibility === "PRIVATE" && inviteLink && (
          <div className="bg-brand-card border border-brand-border tactical-panel-sm p-4 mb-6 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 shrink-0">Link do time:</span>
            <code className="flex-1 text-gray-300 font-mono text-[11px] truncate">{inviteLink}</code>
            <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Link copiado!"); }} className="bg-brand-primary text-black px-3 py-2 tactical-panel-xs hover:bg-brand-primary-light transition-colors"><Copy size={14} /></button>
          </div>
        )}

        {isTeamAdmin && pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" /> Solicitações ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-brand-card border border-yellow-500/30 tactical-panel-xs p-3">
                  <img src={m.user?.avatar || cover([])} onError={onImgError} className="w-10 h-10 tactical-panel-xs object-cover" />
                  <Link to={`/profile/${m.user_id}`} className="flex-1 text-white font-bold text-sm hover:text-brand-primary truncate">{m.user?.name}</Link>
                  <button onClick={() => approve(m)} className="p-2 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-black tactical-panel-xs transition-all"><ThumbsUp size={16} /></button>
                  <button onClick={() => kick(m, true)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white tactical-panel-xs transition-all"><ThumbsDown size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
          <Shield size={16} className="text-brand-primary" /> Operadores ({active.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {active.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-brand-card border border-brand-border tactical-panel-xs p-3">
              <Link to={`/profile/${m.user_id}`}>
                <img src={m.user?.avatar || cover([])} onError={onImgError} className="w-11 h-11 tactical-panel-xs object-cover border border-brand-border" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${m.user_id}`} className="text-white font-bold text-sm hover:text-brand-primary transition-colors truncate block">{m.user?.name}</Link>
                <span className={`text-[9px] font-black uppercase tracking-widest ${m.role === "ADMIN" ? "text-brand-primary" : "text-gray-500"}`}>
                  {m.role === "ADMIN" ? "Admin do Time" : "Membro"}
                </span>
              </div>
              {isTeamAdmin && m.user_id !== team.creator_id && (
                <div className="flex gap-1">
                  <button onClick={() => toggleRole(m)} title={m.role === "ADMIN" ? "Rebaixar" : "Promover a admin"} className="p-1.5 text-gray-500 hover:text-brand-primary transition-colors">
                    <Star size={14} fill={m.role === "ADMIN" ? "currentColor" : "none"} />
                  </button>
                  {m.user_id !== currentUser?.id && (
                    <button onClick={() => kick(m)} title="Remover" className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {(isCreator || isSiteAdmin) && (
          <div className="mt-10 pt-6 border-t border-brand-border">
            <button onClick={doDelete} className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-500/30 px-4 py-2.5 tactical-panel-xs text-xs font-black uppercase tracking-widest transition-all">
              <Trash2 size={14} /> Excluir Time
            </button>
          </div>
        )}
      </div>

      {editOpen && <EditTeamModal team={team} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); load(); }} />}
      {annOpen && <AnnouncementModal team={team} onClose={() => setAnnOpen(false)} onSaved={() => { setAnnOpen(false); load(); }} />}
    </div>
  );
};

const AnnouncementModal: React.FC<{ team: Team; onClose: () => void; onSaved: () => void }> = ({ team, onClose, onSaved }) => {
  const editing = !!team.announcement;
  const [title, setTitle] = useState(team.announcement?.title || "");
  const [description, setDescription] = useState(team.announcement?.description || "");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError("Preencha título e descrição."); return; }
    setLoading(true); setError(null);
    const payload = new FormData();
    payload.append("title", title.trim());
    payload.append("description", description.trim());
    if (image) payload.append("image", image);
    try {
      if (editing) await teamsApi.updateAnnouncement(team.id, payload);
      else await teamsApi.createAnnouncement(team.id, payload);
      toast.success(editing ? "Anúncio atualizado!" : "Anúncio publicado! 📢");
      onSaved();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const inp = "w-full bg-brand-bg border border-brand-border tactical-panel-xs p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none";
  const lbl = "text-xs font-bold text-gray-500 uppercase tracking-widest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-brand-card w-full max-w-lg tactical-panel border border-brand-border p-6 md:p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CornerBrackets corners={["tr", "bl"]} size={16} />
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1 flex items-center gap-2"><Megaphone size={22} className="text-brand-primary" /> {editing ? "Editar Anúncio" : "Novo Anúncio"}</h3>
        <p className="text-gray-500 text-xs mb-6">Fica em destaque no topo da página do time por 7 dias. Só um anúncio por vez.</p>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-3 mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <span className={lbl}>Imagem (opcional)</span>
            <ImagePickerField label="Escolher imagem" file={image} onChange={setImage} current={team.announcement?.image} sizeClass="h-40" />
          </div>
          <div className="space-y-2"><label className={lbl}>Título</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Recrutamento aberto!" className={inp} /></div>
          <div className="space-y-2"><label className={lbl}>Descrição</label><textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do anúncio..." className={inp} /></div>
          <button type="submit" disabled={loading} className="w-full bg-brand-primary text-black hover:bg-brand-primary-light tactical-panel-xs py-3.5 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Megaphone size={16} /> {editing ? "Salvar Anúncio" : "Publicar Anúncio"}</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const EditTeamModal: React.FC<{ team: Team; onClose: () => void; onSaved: () => void }> = ({ team, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: team.name,
    description: team.description || "",
    notice: team.notice || "",
    visibility: team.visibility,
  });
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
    payload.append("notice", form.notice);
    payload.append("visibility", form.visibility);
    if (avatar) payload.append("avatar", avatar);
    if (banner) payload.append("banner", banner);
    try {
      await teamsApi.update(team.id, payload);
      toast.success("Time atualizado!");
      onSaved();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const inp = "w-full bg-brand-bg border border-brand-border tactical-panel-xs p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none";
  const lbl = "text-xs font-bold text-gray-500 uppercase tracking-widest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-brand-card w-full max-w-lg tactical-panel border border-brand-border p-6 md:p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CornerBrackets corners={["tr", "bl"]} size={16} />
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Editar Time</h3>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-3 mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><label className={lbl}>Nome</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} /></div>
          <div className="space-y-2"><label className={lbl}>Descrição</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} /></div>
          <div className="space-y-2"><label className={lbl}><Megaphone size={12} className="inline mr-1" />Aviso / Mural (ex: link de jogo privado)</label><textarea rows={2} value={form.notice} onChange={(e) => setForm({ ...form, notice: e.target.value })} placeholder="Cole aqui um recado ou link para o time..." className={inp} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <span className={lbl}>Logo</span>
              <ImagePickerField label="Trocar logo" file={avatar} onChange={setAvatar} current={team.avatar} sizeClass="aspect-square" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <span className={lbl}>Banner</span>
              <ImagePickerField label="Trocar banner" file={banner} onChange={setBanner} current={team.banner} sizeClass="aspect-square" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({ ...form, visibility: "PUBLIC" })} className={`tactical-panel-xs p-3 text-center border text-xs font-black uppercase transition-all ${form.visibility === "PUBLIC" ? "bg-blue-500/10 border-blue-500 text-blue-400" : "bg-brand-bg border-brand-border text-gray-400"}`}>Público</button>
            <button type="button" onClick={() => setForm({ ...form, visibility: "PRIVATE" })} className={`tactical-panel-xs p-3 text-center border text-xs font-black uppercase transition-all ${form.visibility === "PRIVATE" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-brand-bg border-brand-border text-gray-400"}`}>Privado</button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-primary text-black hover:bg-brand-primary-light tactical-panel-xs py-3.5 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Check size={16} /> Salvar</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default TeamDetail;
