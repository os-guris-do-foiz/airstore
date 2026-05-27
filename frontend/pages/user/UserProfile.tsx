import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Flag
} from "lucide-react";
import { usersApi } from "../../api/users";
import ReportModal from "../../components/modals/ReportModal";

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
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
    };
    fetchUser();
  }, [id]);

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
    // In a real app, this would call reviewApi.create
    // For now we'll just mock local state addition or show a message
    alert("Avaliação enviada com sucesso! (Funcionalidade sendo integrada ao backend)");
    setShowReviewForm(false);
    setComment("");
    setRating(5);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Profile Header */}
      <div
        className={`bg-brand-card rounded-3xl p-8 border ${user.is_donor ? "border-yellow-500/30" : "border-brand-border"} flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xl relative overflow-hidden`}
      >
        {user.is_donor && (
          <div className="absolute top-0 right-0 p-4 z-20">
            <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-yellow-500/20">
              <Crown size={12} fill="currentColor" />
              Doador Premium
            </div>
          </div>
        )}

        <div className="relative z-10 shrink-0">
          <img
            src={user.avatar || "https://picsum.photos/seed/user/200"}
            className={`w-32 h-32 rounded-3xl border-4 ${user.is_donor ? "border-yellow-500" : "border-brand-primary"} shadow-2xl object-cover`}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                {user.name}
              </h1>
              <CheckCircle2 className="text-brand-primary-light" size={24} />
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 text-sm font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-brand-primary" />
                <span>{user.city || "Localização não informada"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-brand-primary" />
                <span>Desde {new Date(user.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-brand-bg px-6 py-3 rounded-2xl border border-brand-border flex flex-col items-center md:items-start">
              <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                Avaliação Média
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="text-white font-black text-xl">
                  {user.rating || "0.0"}
                </span>
                <span className="text-gray-500 text-xs font-bold">/ 5</span>
              </div>
            </div>
            <div className="bg-brand-bg px-6 py-3 rounded-2xl border border-brand-border flex flex-col items-center md:items-start">
              <span className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                Anúncios Ativos
              </span>
              <div className="flex items-center gap-2 text-brand-primary-light">
                <Package size={20} />
                <span className="text-white font-black text-xl">
                  {user.activeAdsCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-primary px-8 h-12 font-black uppercase tracking-tight w-full md:w-auto"
          >
            Avaliar Vendedor
          </button>
          <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest bg-brand-bg hover:bg-red-500/10 px-3 py-2 rounded-xl border border-brand-border hover:border-red-500/20"
            >
              <Flag size={14} /> Denunciar Conta
          </button>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={user.id}
        type="USER"
        title={user.name}
      />

      {showReviewForm && (
        <div className="bg-brand-card p-8 rounded-3xl border border-brand-border shadow-2xl animate-in fade-in duration-300">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">
            Deixar Avaliação
          </h3>
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
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-3 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-8 py-3 font-black uppercase tracking-widest text-xs"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Ads Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Arsenal disponível
            </h2>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              {user.ads?.length || 0} Itens ativos
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {user.ads?.length ? (
              user.ads.map((ad) => (
                <div key={ad.id} className="relative group">
                  <ProductCard ad={ad} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 uppercase font-black tracking-widest text-sm">
                Nenhum equipamento à venda no momento
              </div>
            )}
          </div>
        </div>

        {/* Reviews Sidebar */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Reputação
            </h2>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              {user.reviews?.length || 0} Avaliações
            </div>
          </div>

          <div className="space-y-4">
            {user.reviews?.length ? (
              user.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-brand-card p-6 rounded-2xl border border-brand-border space-y-4 shadow-lg hover:border-brand-primary/30 transition-all"
                >
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-white font-black uppercase tracking-widest">{review.author_name}</p>
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
                  <div className="pt-2 flex justify-end">
                    <span className="text-gray-600 text-[9px] uppercase font-black tracking-widest">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
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
