import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { Ad } from "../../types";
import { Filter, ChevronDown, SlidersHorizontal, Loader2, Search, X } from "lucide-react";
import { adsApi } from "../../api/ads";
import Pagination from "../../components/Pagination";
import { CATEGORY_OPTIONS, MODEL_OPTIONS, TYPE_OPTIONS } from "../../utils/adOptions";
import { CONDITION_OPTIONS } from "../../utils/wear";

const AdsListing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const params = new URLSearchParams(location.search);
  const activeCategory = params.get("category") || "";
  const activeType = params.get("type") || "";
  const activeCondition = params.get("condition") || "";
  const activeModel = params.get("model") || "";
  const activeSort = params.get("sort") || "recent";

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearchInput(p.get("search") || "");
    setMinPriceInput(p.get("minPrice") || "");
    setMaxPriceInput(p.get("maxPrice") || "");
  }, [location.search]);

  useEffect(() => {
    setPage(1);
  }, [location.search]);

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(location.search);
    if (value) p.set(key, value);
    else p.delete(key);
    navigate(`/ads?${p.toString()}`);
  };

  const toggleParam = (key: string, value: string) => {
    const p = new URLSearchParams(location.search);
    setParam(key, p.get(key) === value ? null : value);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("search", searchInput.trim() || null);
  };

  const applyPriceRange = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(location.search);
    if (minPriceInput.trim()) p.set("minPrice", minPriceInput.trim()); else p.delete("minPrice");
    if (maxPriceInput.trim()) p.set("maxPrice", maxPriceInput.trim()); else p.delete("maxPrice");
    navigate(`/ads?${p.toString()}`);
  };

  const clearAllFilters = () => navigate("/ads");

  const hasActiveFilters = ["category", "type", "condition", "model", "search", "minPrice", "maxPrice"].some((k) => params.get(k));

  useEffect(() => {
    const fetchFilteredAds = async () => {
      setLoading(true);
      try {
        const p = new URLSearchParams(location.search);

        const data = await adsApi.getAll({
          category: p.get("category") || undefined,
          type: p.get("type") || undefined,
          condition: p.get("condition") || undefined,
          search: p.get("search") || p.get("model") || undefined,
          minPrice: p.get("minPrice") ? Number(p.get("minPrice")) : undefined,
          maxPrice: p.get("maxPrice") ? Number(p.get("maxPrice")) : undefined,
          sort: (p.get("sort") as any) || undefined,
          page,
        });

        setAds(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err) {
        console.error("Erro ao listar anúncios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredAds();
  }, [location.search, page]);

  const safeAds = Array.isArray(ads) ? ads : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="panel p-5 space-y-7 sticky top-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-black uppercase tracking-tight text-lg font-display">
              <div className="w-8 h-8 tactical-panel-xs bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center">
                <Filter size={16} className="text-brand-purple-light" />
              </div>
              Filtros
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors"
              >
                <X size={10} /> Limpar
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              Categoria
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
              {CATEGORY_OPTIONS.map((c) => {
                const active = activeCategory === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => toggleParam("category", c.value)}
                    className={`px-2.5 py-1 border tactical-panel-xs transition-all ${
                      active
                        ? "bg-brand-purple/20 border-brand-purple text-white"
                        : "bg-brand-bg border-brand-border hover:border-brand-purple hover:text-white hover:bg-brand-purple/10 text-gray-400"
                    }`}
                  >
                    {c.value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              Sistema (Propulsão)
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
              {TYPE_OPTIONS.map((tag) => {
                const active = activeType === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => toggleParam("type", tag)}
                    className={`px-2.5 py-1 border tactical-panel-xs transition-all ${
                      active
                        ? "bg-brand-purple/20 border-brand-purple text-white"
                        : "bg-brand-bg border-brand-border hover:border-brand-purple hover:text-white hover:bg-brand-purple/10 text-gray-400"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              Modelo
            </h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
              {MODEL_OPTIONS.map((tag) => {
                const active = activeModel === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => toggleParam("model", tag)}
                    className={`px-2.5 py-1 border tactical-panel-xs transition-all ${
                      active
                        ? "bg-brand-purple/20 border-brand-purple text-white"
                        : "bg-brand-bg border-brand-border hover:border-brand-purple hover:text-white hover:bg-brand-purple/10 text-gray-400"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              Escala de Desgaste
            </h4>
            <div className="space-y-1.5">
              {CONDITION_OPTIONS.map((c) => {
                const active = activeCondition === c.label;
                return (
                  <button
                    key={c.code}
                    onClick={() => toggleParam("condition", c.label)}
                    className="tactical-panel-xs flex items-center gap-2 w-full px-2 py-1.5 text-[10px] font-bold border transition-all text-left"
                    style={
                      active
                        ? { background: `${c.color}1a`, borderColor: c.color }
                        : { borderColor: "transparent" }
                    }
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                    <span className="font-mono" style={{ color: c.color }}>{c.code}</span>
                    <span className={`uppercase tracking-wider ${active ? "text-white" : "text-gray-400"}`}>{c.label.replace(/\s*\([A-Z]+\)$/, "")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={applyPriceRange} className="space-y-3">
            <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              Preço Estimado
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="input-field text-xs h-9"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="input-field text-xs h-9"
              />
            </div>
            <button
              type="submit"
              className="tactical-panel-xs w-full bg-brand-bg border border-brand-border hover:border-brand-primary hover:text-brand-primary text-gray-400 text-[10px] font-black uppercase tracking-widest py-2 transition-colors"
            >
              Aplicar Faixa
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 space-y-6">
        <form onSubmit={submitSearch} className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por modelo, marca, tipo... (ex: M4, AEG, sniper)"
            className="w-full bg-brand-card border border-brand-border tactical-panel-xs pl-12 pr-24 py-3.5 text-white placeholder-gray-600 focus:border-brand-primary outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); navigate("/ads"); }}
              className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary text-black px-4 py-2 tactical-panel-xs text-xs font-black uppercase tracking-widest hover:bg-brand-primary-light transition-colors"
          >
            Buscar
          </button>
        </form>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "category", value: params.get("category"), label: params.get("category") },
              { key: "type", value: activeType, label: activeType },
              { key: "model", value: activeModel, label: activeModel },
              { key: "condition", value: activeCondition, label: activeCondition },
              { key: "search", value: params.get("search"), label: `"${params.get("search")}"` },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <button
                  key={f.key}
                  onClick={() => setParam(f.key, null)}
                  className="tactical-panel-xs flex items-center gap-1.5 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple/20 transition-colors"
                >
                  {f.label} <X size={11} />
                </button>
              ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight font-display">
            {loading ? (
              "Localizando Alvos..."
            ) : (
              <>
                <span className="text-brand-primary text-glow-lime">{total}</span>{" "}
                {total === 1 ? "Anúncio" : "Anúncios"}
              </>
            )}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 bg-brand-card border border-brand-border px-4 py-2 tactical-panel-xs text-sm font-bold text-white"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>

            <div className="relative flex-1 md:flex-none">
              <select
                value={activeSort}
                onChange={(e) => setParam("sort", e.target.value === "recent" ? null : e.target.value)}
                className="input-field h-10 text-sm pr-8 appearance-none w-full md:w-48 bg-brand-card"
              >
                <option value="recent">Mais recentes</option>
                <option value="views">Mais vistos</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
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
                className="bg-brand-card aspect-[4/5] tactical-panel-xs animate-pulse border border-brand-border flex items-center justify-center"
              >
                 <Loader2 className="animate-spin text-gray-800" size={24} />
              </div>
            ))}
          </div>
        ) : safeAds.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {safeAds.map((ad) => (
                <ProductCard key={ad.id} ad={ad} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
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
              className="px-6 py-2 border border-brand-primary text-brand-primary font-bold hover:bg-brand-primary hover:text-black transition-all uppercase text-xs tactical-panel-xs"
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
