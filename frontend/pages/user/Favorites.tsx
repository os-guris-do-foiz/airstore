import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2, Search } from "lucide-react";
import { favoritesApi } from "../../api/favorites";
import { Ad } from "../../types";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination";
import SectionMarker from "../../components/SectionMarker";
import { isLoggedIn } from "../../utils/auth";

const Favorites: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const logged = isLoggedIn();

  useEffect(() => {
    document.title = "Meus Favoritos — Fronteira Airsoft";
    return () => {
      document.title = "Fronteira Airsoft | A Elite do Airsoft Brasil";
    };
  }, []);

  useEffect(() => {
    if (!logged) {
      setLoading(false);
      return;
    }
    setLoading(true);
    favoritesApi
      .list(page)
      .then((data) => {
        setAds(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      })
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, [page, logged]);

  if (!logged) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Heart className="mx-auto text-brand-border mb-4" size={56} />
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Favoritos</h2>
        <p className="text-gray-500 mb-6">Entre na sua conta para salvar e ver os seus anúncios favoritos.</p>
        <Link to="/login" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-black px-6 py-3 tactical-panel-xs font-black uppercase tracking-widest text-sm transition-all">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <SectionMarker title="Meus Favoritos" count={`${total} ${total === 1 ? "anúncio" : "anúncios"}`} />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      ) : ads.length === 0 ? (
        <div className="tactical-panel text-center py-20 border border-dashed border-brand-border mt-8">
          <Heart className="mx-auto text-brand-border mb-4" size={56} />
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Nenhum favorito ainda</h3>
          <p className="text-gray-500 text-sm mb-6">Toque no coração de um anúncio para guardá-lo aqui.</p>
          <Link to="/ads" className="inline-flex items-center gap-2 bg-brand-bg border border-brand-border hover:border-brand-primary text-white px-6 py-3 tactical-panel-xs font-black uppercase tracking-widest text-sm transition-colors">
            <Search size={16} /> Explorar anúncios
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {ads.map((ad) => (
              <ProductCard key={ad.id} ad={ad} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Favorites;
