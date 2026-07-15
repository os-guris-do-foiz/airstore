import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { UserProfile as UserProfileType } from "../../types";
import {
  MapPin,
  Star,
  Calendar,
  Package,
  CheckCircle2,
  Crown,
  Loader2,
  Flag,
  Pencil,
  Camera,
  X,
  Save,
  AtSign,
  Hash,
  Trash2,
  Shield
} from "lucide-react";
import { usersApi } from "../../api/users";
import { adsApi } from "../../api/ads";
import { teamsApi, Team } from "../../api/teams";
import ReportModal from "../../components/modals/ReportModal";
import Pagination from "../../components/Pagination";
import { onImgError } from "../../utils/img";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";
import ImagePickerField from "../../components/ImagePickerField";
import CornerBrackets from "../../components/CornerBrackets";
import SectionMarker from "../../components/SectionMarker";
import { Ad } from "../../types";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({ name: "", nickname: "", bio: "", city: "" });
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [featuredTeamId, setFeaturedTeamId] = useState<string | null>(null);

  const [ads, setAds] = useState<Ad[]>([]);
  const [adsTotal, setAdsTotal] = useState(0);
  const [adsPage, setAdsPage] = useState(1);
  const [adsTotalPages, setAdsTotalPages] = useState(1);

  const currentUserStr = localStorage.getItem("fronteira_user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isOwnProfile = currentUser && currentUser.id === id;
  const isAdmin = currentUser?.roles?.includes("ADMIN");

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      const data = await usersApi.getProfile(id);
      setUser(data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setAdsPage(1);
  }, [id]);

  const fetchAds = useCallback(async () => {
    if (!id) return;
    try {
      const data = await adsApi.getByUser(id, adsPage, 20);
      setAds(data.items);
      setAdsTotal(data.total);
      setAdsTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao buscar anúncios do usuário:", err);
    }
  }, [id, adsPage]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-brand-primary">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  if (!user)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Usuário não encontrado
      </div>
    );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!currentUser) {
      setReviewError("Você precisa estar logado para avaliar.");
      return;
    }

    setSubmitting(true);
    setReviewError(null);
    try {
      if (isEditingReview) {
        await usersApi.editReview(id, { score: rating, content: comment });
        toast.success("Avaliação atualizada!");
      } else {
        await usersApi.addReview(id, { score: rating, content: comment });
        toast.success("Avaliação enviada!");
      }
      await fetchUser();
      setShowReviewForm(false);
      setIsEditingReview(false);
      setComment("");
      setRating(5);
    } catch (err: any) {
      setReviewError(err.message || "Falha ao enviar avaliação.");
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewForm = (edit: boolean, existing?: { rating: number; comment: string }) => {
    setIsEditingReview(edit);
    setReviewError(null);
    setRating(existing?.rating || 5);
    setComment(existing?.comment || "");
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return;
    if (!(await confirmDialog({ title: "Apagar avaliação", message: "Tem certeza que deseja apagar esta avaliação?", confirmText: "Apagar", danger: true }))) return;
    try {
      await usersApi.deleteReview(id, reviewId);
      toast.success("Avaliação apagada.");
      await fetchUser();
    } catch (err: any) {
      toast.error(err.message || "Falha ao apagar a avaliação.");
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!(await confirmDialog({ title: "Apagar anúncio", message: "Apagar este anúncio definitivamente? Esta ação não pode ser desfeita.", confirmText: "Apagar", danger: true }))) return;
    try {
      await adsApi.delete(adId);
      toast.success("Anúncio apagado.");
      await Promise.all([fetchUser(), fetchAds()]);
    } catch (err: any) {
      toast.error(err.message || "Falha ao apagar o anúncio.");
    }
  };

  const openEditor = () => {
    if (!user) return;
    setEditForm({
      name: user.name || "",
      nickname: user.nickname || "",
      bio: user.bio || "",
      city: user.city || "",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setBannerFile(null);
    setFeaturedTeamId(user.featured_team?.id || null);
    setProfileError(null);
    setIsEditOpen(true);
    teamsApi
      .getMine()
      .then((teams) => setMyTeams(teams.filter((t) => t.my_status === "ACTIVE")))
      .catch(() => setMyTeams([]));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingProfile(true);
    setProfileError(null);

    const payload = new FormData();
    payload.append("name", editForm.name);
    payload.append("nickname", editForm.nickname);
    payload.append("bio", editForm.bio);
    payload.append("city", editForm.city);
    if (avatarFile) payload.append("avatar", avatarFile);
    if (bannerFile) payload.append("banner", bannerFile);

    try {
      const updated = await usersApi.updateProfile(id, payload);
      const currentFeatured = user.featured_team?.id || null;
      if (featuredTeamId !== currentFeatured) {
        await teamsApi.setFeatured(featuredTeamId);
      }
      await fetchUser();
      const stored = localStorage.getItem("fronteira_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("fronteira_user", JSON.stringify({ ...parsed, name: updated.name, avatar: updated.avatar, nickname: updated.nickname }));
      }
      setIsEditOpen(false);
      toast.success("Perfil atualizado!");
    } catch (err: any) {
      setProfileError(err.message || "Falha ao salvar o perfil.");
      toast.error(err.message || "Falha ao salvar o perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const myReview = (user.reviews || []).find((r: any) => r.author_id === currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <div
        className={`tactical-panel bg-brand-card border ${user.is_donor ? "border-yellow-500/30" : "border-brand-border"} shadow-2xl relative overflow-hidden`}
      >
        <CornerBrackets corners={["tr", "bl"]} color={user.is_donor ? "#eab308" : "var(--color-brand-primary)"} size={22} />

        <div className="relative h-40 md:h-56 w-full overflow-hidden">
          {user.banner ? (
            <img
              src={user.banner}
              onError={onImgError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-primary/25 via-brand-bg to-brand-purple/20 grid-overlay" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/30 to-transparent" />
          {user.is_donor && (
            <div className="absolute top-4 right-4 z-20">
              <div className="tactical-panel-xs bg-yellow-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-yellow-500/20 font-mono">
                <Crown size={12} fill="currentColor" />
                Doador Premium
              </div>
            </div>
          )}
        </div>

        <div className="px-6 md:px-8 pb-8 -mt-16 md:-mt-20 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
          <div className="shrink-0 relative">
            <img
              src={user.avatar || "https://picsum.photos/seed/user/200"}
              onError={onImgError}
              className={`tactical-panel-sm w-32 h-32 border-4 ${user.is_donor ? "border-yellow-500" : "border-brand-primary"} shadow-2xl object-cover bg-brand-card`}
              referrerPolicy="no-referrer"
            />
            <CornerBrackets corners={["tr", "bl"]} color={user.is_donor ? "#eab308" : "var(--color-brand-primary)"} size={12} thickness={2} inset={-4} />
          </div>

          <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-4xl font-black text-white uppercase tracking-tight font-display">
                {user.name}
              </h1>
              <CheckCircle2 className="text-brand-primary-light" size={24} />
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              {user.nickname && (
                <div className="flex items-center gap-1 text-brand-primary-light font-bold text-sm">
                  <AtSign size={14} />
                  <span>{user.nickname}</span>
                </div>
              )}
              <button
                onClick={() => { navigator.clipboard.writeText(`#${user.id}`); toast.success("ID copiado!"); }}
                className="tactical-panel-xs flex items-center gap-1 text-[10px] font-mono font-bold text-gray-500 hover:text-brand-primary bg-brand-bg border border-brand-border px-2 py-1 transition-colors"
                title="Copiar ID (identificador único)"
              >
                <Hash size={11} />{user.id}
              </button>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 text-sm font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-brand-primary" />
                <span>{user.city || "Localização não informada"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-brand-primary" />
                <span>Desde {new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {user.bio && (
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl whitespace-pre-line normal-case">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="tactical-panel-sm bg-brand-bg pl-4 pr-6 py-3 border border-brand-border border-l-2 border-l-yellow-500 flex flex-col items-center md:items-start">
              <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                Avaliação Média
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="text-white font-black text-xl font-mono">
                  {user.rating || "0.0"}
                </span>
                <span className="text-gray-500 text-xs font-bold">/ 5</span>
              </div>
            </div>
            <div className="tactical-panel-sm bg-brand-bg pl-4 pr-6 py-3 border border-brand-border border-l-2 border-l-brand-primary flex flex-col items-center md:items-start">
              <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                Anúncios Ativos
              </span>
              <div className="flex items-center gap-2 text-brand-primary-light">
                <Package size={20} />
                <span className="text-white font-black text-xl font-mono">
                  {user.activeAdsCount || 0}
                </span>
              </div>
            </div>

            {user.featured_team && (
              <Link
                to={`/teams/${user.featured_team.id}`}
                className="tactical-panel-sm bg-brand-bg pl-4 pr-6 py-3 border border-brand-primary/30 border-l-2 border-l-brand-purple hover:border-brand-primary flex items-center gap-3 transition-colors group"
              >
                <img
                  src={user.featured_team.avatar || "https://picsum.photos/seed/" + user.featured_team.id + "/60"}
                  onError={onImgError}
                  className="tactical-panel-xs w-10 h-10 object-cover border border-brand-border"
                />
                <div className="flex flex-col items-start">
                  <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                    <Shield size={10} /> Time
                  </span>
                  <span className="text-white font-black text-sm group-hover:text-brand-primary transition-colors">{user.featured_team.name}</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          {isOwnProfile ? (
            <button
              onClick={openEditor}
              className="btn-primary tactical-panel-xs px-8 h-12 font-black uppercase tracking-tight w-full md:w-auto flex items-center justify-center gap-2"
            >
              <Pencil size={16} /> Editar Perfil
            </button>
          ) : (
            <button
              onClick={() => openReviewForm(!!myReview, myReview ? { rating: myReview.rating, comment: myReview.comment } : undefined)}
              className="btn-primary tactical-panel-xs px-8 h-12 font-black uppercase tracking-tight w-full md:w-auto flex items-center justify-center gap-2"
            >
              {myReview ? <><Pencil size={16} /> Editar Avaliação</> : "Avaliar Vendedor"}
            </button>
          )}
          {!isOwnProfile && (
            <button
                onClick={() => setIsReportModalOpen(true)}
                className="tactical-panel-xs flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest bg-brand-bg hover:bg-red-500/10 px-3 py-2 border border-brand-border hover:border-red-500/20"
              >
                <Flag size={14} /> Denunciar Conta
            </button>
          )}
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={user.id}
        type="USER"
        title={user.name}
      />

      {isEditOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          <div className="tactical-panel relative z-10 bg-brand-card w-full max-w-lg border border-brand-border p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <CornerBrackets corners={["tr", "bl"]} size={16} />
            <button onClick={() => setIsEditOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6 font-display">Editar Perfil</h3>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={avatarPreview || user.avatar || "https://picsum.photos/seed/user/200"}
                  onError={onImgError}
                  className="tactical-panel-xs w-20 h-20 object-cover border-2 border-brand-primary"
                  referrerPolicy="no-referrer"
                />
                <label className="tactical-panel-xs flex-1 cursor-pointer flex flex-col items-center justify-center gap-1 border-2 border-dashed border-brand-border p-4 hover:border-brand-primary/50 transition-colors">
                  <Camera size={20} className="text-gray-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {avatarFile ? "Foto selecionada" : "Trocar foto"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Banner do Perfil</label>
                <ImagePickerField label="Escolher banner" file={bannerFile} onChange={setBannerFile} current={user.banner} sizeClass="h-28" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome</label>
                  <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-white focus:border-brand-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Apelido / Callsign</label>
                  <input type="text" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} placeholder="Ex: Ghost" className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cidade</label>
                <input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} placeholder="Ex: Foz do Iguaçu - PR" className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bio</label>
                <textarea rows={4} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Conte um pouco sobre você, seu estilo de jogo, equipe..." className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={12} /> Time em destaque no perfil
                </label>
                {myTeams.length === 0 ? (
                  <p className="text-gray-600 text-xs italic bg-brand-bg border border-brand-border rounded-xl p-3">
                    Você ainda não participa de nenhum time. Entre em um em <Link to="/teams" className="text-brand-primary font-bold not-italic">Times</Link>.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFeaturedTeamId(null)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 border text-left transition-all ${featuredTeamId === null ? "bg-brand-primary/10 border-brand-primary" : "bg-brand-bg border-brand-border hover:border-brand-primary/40"}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center shrink-0">
                        <X size={16} className="text-gray-500" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nenhum</span>
                    </button>
                    {myTeams.map((t) => {
                      const selected = featuredTeamId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFeaturedTeamId(t.id)}
                          className={`flex items-center gap-2 rounded-xl p-2.5 border text-left transition-all ${selected ? "bg-brand-primary/10 border-brand-primary" : "bg-brand-bg border-brand-border hover:border-brand-primary/40"}`}
                        >
                          <img
                            src={t.avatar || "https://picsum.photos/seed/" + t.id + "/60"}
                            onError={onImgError}
                            className="w-9 h-9 rounded-lg object-cover border border-brand-border shrink-0"
                          />
                          <span className={`text-xs font-black uppercase tracking-wider truncate ${selected ? "text-white" : "text-gray-300"}`}>{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {profileError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">{profileError}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 rounded-xl border border-brand-border text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Cancelar</button>
                <button type="submit" disabled={savingProfile} className="flex-1 py-3 rounded-xl bg-brand-primary text-black hover:bg-brand-primary-light text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {savingProfile ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="tactical-panel bg-brand-card p-8 border border-brand-border shadow-2xl relative animate-in fade-in duration-300">
          <CornerBrackets corners={["tr", "bl"]} size={16} />
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 font-display">
            {isEditingReview ? "Editar Avaliação" : "Deixar Avaliação"}
          </h3>
          <p className="text-gray-500 text-xs mb-6">
            {isEditingReview
              ? "Atualize sua nota e comentário."
              : "Você pode fazer no máximo 1 avaliação por dia."}
          </p>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Sua Nota
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl transition-colors"
                  >
                    <Star
                      fill={star <= rating ? "#eab308" : "none"}
                      className={
                        star <= rating ? "text-yellow-500" : "text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Detalhes da Experiência
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="input-field w-full py-4 min-h-[120px]"
                placeholder="Como foi sua experiência com este vendedor?"
              />
            </div>
            {reviewError && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                {reviewError}
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => { setShowReviewForm(false); setIsEditingReview(false); }}
                className="px-6 py-3 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-8 py-3 font-black uppercase tracking-widest text-xs disabled:opacity-50"
              >
                {submitting ? "Enviando..." : isEditingReview ? "Salvar Alterações" : "Enviar Avaliação"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <SectionMarker title="Arsenal disponível" count={`${adsTotal} Itens`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ads.length ? (
              ads.map((ad) => (
                <div key={ad.id} className="relative group">
                  <ProductCard ad={ad} />
                  {isOwnProfile && (
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      title="Apagar anúncio"
                      className="absolute top-3 right-3 z-10 bg-black/70 hover:bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm border border-white/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 uppercase font-black tracking-widest text-sm">
                Nenhum equipamento à venda no momento
              </div>
            )}
          </div>

          <Pagination page={adsPage} totalPages={adsTotalPages} onChange={setAdsPage} />
        </div>

        <div className="space-y-8">
          <SectionMarker title="Reputação" count={`${user.reviews?.length || 0} Avaliações`} />

          <div className="space-y-4">
            {user.reviews?.length ? (
              user.reviews.map((review) => {
                const isMine = review.author_id === currentUser?.id;
                const canDeleteReview = isMine || isAdmin;
                return (
                <div
                  key={review.id}
                  className="tactical-panel-sm bg-brand-card p-6 border border-brand-border border-l-2 border-l-brand-purple/50 space-y-4 shadow-lg hover:border-brand-primary/30 transition-all"
                >
                  <div className="flex justify-between items-center text-xs">
                    <Link
                      to={`/profile/${review.author_id}`}
                      className="flex items-center gap-2 group"
                    >
                      <img
                        src={review.author_avatar || "https://picsum.photos/seed/" + review.author_id + "/60"}
                        onError={onImgError}
                        referrerPolicy="no-referrer"
                        className="rounded-full w-7 h-7 object-cover border border-brand-border"
                      />
                      <span className="text-white font-black uppercase tracking-widest group-hover:text-brand-primary transition-colors">{review.author_name}</span>
                    </Link>
                    <div className="flex text-yellow-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={i < (review.rating || 0) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm italic leading-relaxed">
                    "{review.comment}"
                  </p>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-gray-600 text-[9px] uppercase font-black tracking-widest">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {isMine && (
                        <button
                          onClick={() => openReviewForm(true, { rating: review.rating, comment: review.comment })}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                      )}
                      {canDeleteReview && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} /> {isAdmin && !isMine ? "Apagar (Admin)" : "Apagar"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-gray-600 uppercase font-black tracking-widest text-[10px]">
                Nenhuma avaliação disponível
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
