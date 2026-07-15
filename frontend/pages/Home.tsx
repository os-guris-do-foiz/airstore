import React, { useState, useEffect, useRef } from "react";
import SearchBar from "../components/SearchBar";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { Ad } from "../types";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { adsApi } from "../api/ads";

const AdRow = ({
  title,
  ads,
  link,
}: {
  title: string;
  ads: Ad[];
  link: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused || !scrollRef.current || !ads || ads.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, ads?.length]);

  const handleManualScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      setIsPaused(true);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 10000);
    }
  };

  return (
    <section className="space-y-6 relative group/row">
      <div className="flex items-center justify-between">
        <Link to={link} className="group flex items-center gap-3">
          <div className="w-2 h-8 bg-brand-primary rounded-full group-hover:bg-brand-primary-light transition-colors" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-brand-primary-light transition-colors font-display">
            {title}
          </h2>
        </Link>
        <Link
          to={link}
          className="flex items-center gap-1 text-brand-primary-light hover:text-white transition-colors font-bold text-sm uppercase group"
        >
          Ver todos{" "}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => handleManualScroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-all -left-6 hover:bg-brand-primary hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => handleManualScroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-all -right-6 hover:bg-brand-primary hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {ads && ads.length > 0 ? (
            ads.map((ad) => (
              <div key={ad.id} className="w-[260px] md:w-[300px] shrink-0">
                <ProductCard ad={ad} />
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-center text-gray-600 border border-dashed border-gray-800 tactical-panel-sm">
              Nenhum anúncio nesta categoria ainda.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [spotlightAds, setSpotlightAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [list, spotlight] = await Promise.all([
          adsApi.getAll(),
          adsApi.getSpotlight(10),
        ]);
        setAds(list.items);
        setSpotlightAds(spotlight);
      } catch (err) {
        console.error("Erro ao carregar anúncios:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  const safeAds = Array.isArray(ads) ? ads : [];
  const activeAds = safeAds.filter(ad => !ad.is_sold).sort((a, b) => {
    if (a.is_donor && !b.is_donor) return -1;
    if (!a.is_donor && b.is_donor) return 1;
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  const filterByModel = (model: string) =>
    activeAds.filter((ad) => ad.model?.toLowerCase().includes(model.toLowerCase()));

  const filterByCategory = (category: string) =>
    activeAds.filter((ad) => ad.category === category);

  return (
    <div className="space-y-16 pb-20">
      <section className="space-y-0 px-0 md:px-0 max-w-[1600px] mx-auto">
        <HeroCarousel ads={spotlightAds} />
        <SearchBar />
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryBar />
      </section>

      <div className="space-y-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <AdRow
          title="Fuzis"
          ads={activeAds.filter(
            (ad) =>
              ["M4", "AK47", "Fuzil", "M4A1", "M4 CQB", "HK416"].some(m => ad.model?.includes(m)),
          )}
          link="/ads?model=Fuzil"
        />

        <AdRow
          title="Pistolas"
          ads={filterByModel("Pistola")}
          link="/ads?model=Pistola"
        />

        <AdRow
          title="Snipers"
          ads={filterByModel("Sniper")}
          link="/ads?model=Sniper"
        />

        <AdRow
          title="Armas de Airsoft"
          ads={filterByCategory("Airsoft")}
          link="/ads?category=Airsoft"
        />

        <AdRow
          title="Serviços & Manutenção"
          ads={filterByCategory("Serviços")}
          link="/ads?category=Serviços"
        />
      </div>
    </div>
  );
};

export default Home;
