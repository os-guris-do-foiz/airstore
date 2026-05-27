import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { Ad } from "../../types";
import { Filter, ChevronDown, SlidersHorizontal, Loader2 } from "lucide-react";
import { adsApi } from "../../api/ads";

const AdsListing: React.FC = () => {
  const location = useLocation();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchFilteredAds = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const model = params.get("model");
        const category = params.get("category");
        const search = params.get("search");
        
        const data = await adsApi.getAll({ 
          category: category || undefined, 
          search: search || model || undefined 
        });

        // Backend ja filtra as coisas básicas, mas podemos refinar sorts aqui se necessário
        const filteredAds = data.filter(ad => !ad.is_sold);
        
        filteredAds.sort((a, b) => {
          if (a.is_donor && !b.is_donor) return -1;
          if (!a.is_donor && b.is_donor) return 1;
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
        
        setAds(filteredAds);
      } catch (err) {
        console.error("Erro ao listar anúncios:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilteredAds();
  }, [location.search]);

  const safeAds = Array.isArray(ads) ? ads : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters - Desktop */}
      <aside className="hidden lg:block w-64 space-y-8 shrink-0">
        <div className="flex items-center gap-2 text-white font-black uppercase tracking-tight text-xl">
          <Filter size={20} className="text-brand-primary" />
          Filtros
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Geral
            </h4>
            <p className="text-[10px] text-gray-500 uppercase font-bold leading-relaxed">
              O Marketplace da Fronteira usa inteligência de busca por texto. Tente pesquisar pelo modelo acima.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Categorias Frequentes
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
               {["AEG", "GBB", "HPA", "Spring", "Sniper", "Pistola", "M4", "AK47"].map(tag => (
                 <a key={tag} href={`/ads?search=${tag}`} className="px-2 py-1 bg-brand-bg border border-brand-border rounded hover:border-brand-primary transition-colors text-gray-400 hover:text-white">
                   {tag}
                 </a>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Preço Estimado
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                className="input-field text-xs h-8"
              />
              <input
                type="number"
                placeholder="Max"
                className="input-field text-xs h-8"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            {loading ? "Localizando Alvos..." : `${safeAds.length} ${safeAds.length === 1 ? "Anúncio" : "Anúncios"} encontrados`}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 bg-brand-card border border-brand-border px-4 py-2 rounded-lg text-sm font-bold text-white"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>

            <div className="relative flex-1 md:flex-none">
              <select className="input-field h-10 text-sm pr-8 appearance-none w-full md:w-48 bg-brand-card">
                <option>Mais recentes</option>
                <option>Menor preço</option>
                <option>Maior preço</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={16}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-brand-card aspect-[4/5] rounded-xl animate-pulse border border-brand-border flex items-center justify-center"
              >
                 <Loader2 className="animate-spin text-gray-800" size={24} />
              </div>
            ))}
          </div>
        ) : safeAds.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {safeAds.map((ad) => (
              <ProductCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <p className="text-gray-500 text-lg uppercase font-black">
              Sem inteligência de campo.
            </p>
            <p className="text-gray-600 text-sm">
              Nenhum anúncio encontrado com os parâmetros atuais.
            </p>
            <button
              onClick={() => (window.location.href = "/ads")}
              className="px-6 py-2 border border-brand-primary text-brand-primary font-bold hover:bg-brand-primary hover:text-black transition-all uppercase text-xs rounded-lg"
            >
              Limpar Inteligência
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsListing;
