import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  MessageCircle,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  Info,
  ChevronRight,
  Share2,
  Flag,
  Crown,
  Loader2,
} from "lucide-react";
import { Ad } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { adsApi } from "../../api/ads";
import ReportModal from "../../components/modals/ReportModal";

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserStr = localStorage.getItem("fronteira_user");
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isOwner = ad && currentUser && ad.user_id === currentUser.id;

  useEffect(() => {
    if (isPaused || !ad || ad.images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % ad.images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, ad]);

  const handleInteraction = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 10000);
  };

  useEffect(() => {
    const fetchAd = async () => {
      if (!id) return;
      try {
        const data = await adsApi.getById(id);
        setAd(data);
      } catch (err) {
        console.error("Erro ao carregar anúncio:", err);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );

  if (!ad)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white space-y-4">
        <h2 className="text-2xl font-black uppercase">Anúncio não encontrado</h2>
        <Link to="/ads" className="text-brand-primary hover:underline uppercase text-sm font-bold">Voltar ao Marketplace</Link>
      </div>
    );

  const whatsappUrl = `https://wa.me/${ad.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi seu anúncio no Fronteira Airsoft: ${ad.title}. Ainda está disponível?`)}`;

  const nextImage = () => {
    handleInteraction();
    setActiveImage((prev) => (prev + 1) % ad.images.length);
  };

  const prevImage = () => {
    handleInteraction();
    setActiveImage((prev) => (prev - 1 + ad.images.length) % ad.images.length);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja apagar este anúncio definitivamente?")) {
       try {
         await adsApi.delete(ad.id);
         navigate("/ads");
       } catch (err: any) {
         alert(err.message || "Erro ao deletar anúncio.");
       }
    }
  };

  const handleMarkAsSold = async () => {
    if (window.confirm("Confirmar a venda deste equipamento? O anúncio deixará de ser visível no marketplace.")) {
      try {
        const updated = await adsApi.update(ad.id, { is_sold: true });
        setAd(updated);
      } catch (err: any) {
        alert(err.message || "Erro ao atualizar anúncio.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          to="/ads"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary-light transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft size={14} /> Voltar para a busca
        </Link>
        <div className="flex items-center gap-4">
          {isOwner && !ad.is_sold && (
            <>
              <button
                onClick={handleMarkAsSold}
                className="flex items-center gap-2 text-brand-green hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-lg border border-brand-green/20"
              >
                <Flag size={14} /> Marcar como Vendido
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20"
              >
                Apagar Anúncio
              </button>
            </>
          )}
          <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
            <Share2 size={14} /> Compartilhar
          </button>
          {!isOwner && (
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest bg-brand-card hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-brand-border hover:border-red-500/20"
            >
              <Flag size={14} /> Denunciar
            </button>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={ad.id}
        type="AD"
        title={ad.title}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Description (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Premium Gallery */}
          <div className="space-y-4">
            <div
              className={`relative aspect-[16/9] bg-brand-card rounded-3xl overflow-hidden border ${ad.is_sold ? "border-red-500/50" : ad.is_donor ? "border-yellow-500/30" : "border-brand-border"} shadow-2xl group`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={ad.images[activeImage]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`w-full h-full object-cover ${ad.is_sold ? "grayscale opacity-50" : ""}`}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {ad.is_sold && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-2xl flex items-center gap-3 shadow-2xl rotate-[-10deg] border-4 border-white/20">
                    <Flag size={24} />
                    Vendido
                  </div>
                </div>
              )}

              {/* Overlay Badges */}
              <div className="absolute top-6 left-6 flex gap-2 z-10">
                {ad.is_donor && !ad.is_sold && (
                  <span className="bg-yellow-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Crown size={12} fill="currentColor" />
                    Doador Premium
                  </span>
                )}
                <span className="bg-brand-primary text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {ad.type}
                </span>
                {ad.category !== "Serviços" && ad.condition && ad.condition !== "N/A" && (
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-lg">
                    {ad.condition}
                  </span>
                )}
              </div>

              {/* Navigation Arrows */}
              {ad.images && ad.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-black"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-black"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10">
                {activeImage + 1} / {ad.images?.length || 0}
              </div>
            </div>

            {/* Thumbnails */}
            {ad.images && ad.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {ad.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImage(i);
                      handleInteraction();
                    }}
                    className={`relative w-[100px] md:w-[140px] aspect-video shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-brand-primary scale-95 shadow-lg shadow-white/10"
                        : "border-gray-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-brand-card rounded-3xl p-8 border border-gray-800 shadow-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Descrição Completa
              </h2>
            </div>

            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg font-medium">
              {ad.description}
            </div>

            {/* Tags - O backend ainda não salva tags formalmente, mas podemos mostrar a categoria e type como tags */}
            <div className="pt-8 border-t border-gray-800">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
                Classificação
              </h3>
              <div className="flex flex-wrap gap-2">
                {[ad.category, ad.type, ad.model, ad.brand].filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="bg-brand-bg border border-gray-800 text-brand-primary-light px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-black transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Seller (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Info Card */}
          <div className="bg-brand-card rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-8 sticky top-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-primary-light text-[10px] font-black uppercase tracking-widest">
                <Calendar size={14} />
                Publicado em{" "}
                {new Date(ad.created_at).toLocaleDateString("pt-BR")}
              </div>
              <h1 className="text-4xl font-black text-white leading-none uppercase tracking-tighter">
                {ad.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                <MapPin size={18} className="text-brand-primary" />
                <span>{ad.location}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Preço de Venda
              </p>
              <div className="text-5xl font-black text-brand-green tracking-tighter">
                R$ {ad.price.toLocaleString("pt-BR")}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ...(ad.category !== "Serviços"
                  ? [
                      { label: "Modelo", value: ad.model || "N/A" },
                      { label: "Marca", value: ad.brand || "N/A" },
                      { label: "FPS", value: ad.fps || "N/A" },
                    ]
                  : []),
                {
                  label: "Aceita Troca",
                  value: ad.accepts_trade ? "Sim" : "Não",
                  color: ad.accepts_trade ? "text-brand-green" : "text-red-500",
                },
              ].map((spec, i) => (
                <div
                  key={i}
                  className="bg-brand-bg/50 p-4 rounded-2xl border border-gray-800/50"
                >
                  <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">
                    {spec.label}
                  </p>
                  <p
                    className={`font-black text-sm uppercase ${spec.color || "text-white"}`}
                  >
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {ad.is_sold ? (
                <div className="bg-red-500/10 border border-red-500/30 w-full h-16 rounded-xl text-red-500 text-lg font-black tracking-widest flex items-center justify-center gap-3">
                  <Flag size={24} />
                  EQUIPAMENTO VENDIDO
                </div>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success w-full h-16 text-lg font-black tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-brand-green/10 hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle size={24} />
                  CONTATO WHATSAPP
                </a>
              )}
              <div className="flex items-center gap-2 text-gray-500 text-[9px] uppercase font-black justify-center tracking-widest">
                <ShieldCheck size={14} className="text-brand-green" />
                Negociação Segura via Fronteira Airsoft
              </div>
            </div>

            {/* Seller Info Mini */}
            <div className="pt-8 border-t border-gray-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Vendedor
                </h3>
                <Link
                  to={`/profile/${ad.user_id}`}
                  className="text-brand-primary-light text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Ver Perfil
                </Link>
              </div>

              <Link
                to={`/profile/${ad.user_id}`}
                className="flex items-center gap-4 group"
              >
                <div className="relative">
                  <img
                    src={ad.user?.avatar || "https://picsum.photos/seed/user/200"}
                    className={`w-16 h-16 rounded-2xl border-2 ${ad.user?.is_donor ? "border-yellow-500" : "border-brand-primary"} group-hover:border-brand-primary-light transition-all object-cover`}
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 ${ad.user?.is_donor ? "bg-yellow-500" : "bg-brand-green"} rounded-full border-2 border-brand-card flex items-center justify-center`}
                  >
                    {ad.user?.is_donor ? (
                      <Crown
                        size={10}
                        className="text-black"
                        fill="currentColor"
                      />
                    ) : (
                      <ShieldCheck size={10} className="text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black group-hover:text-brand-primary-light transition-colors truncate text-lg leading-tight uppercase">
                      {ad.user?.name}
                    </p>
                    {ad.user?.is_donor && (
                      <Crown
                        size={14}
                        className="text-yellow-500"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-black">
                      {ad.user?.rating || "4.8"}
                    </span>
                    <span className="text-gray-500 text-[10px] font-bold">
                      ({ad.user?.reviewsCount || "0"} avaliações)
                    </span>
                  </div>
                </div>
              </Link>

              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 flex gap-3">
                <Info className="text-brand-primary-light shrink-0" size={18} />
                <p className="text-[10px] text-gray-400 leading-relaxed font-bold">
                  Dica: Nunca faça pagamentos antecipados sem ver o equipamento
                  pessoalmente ou por vídeo chamada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetail;
