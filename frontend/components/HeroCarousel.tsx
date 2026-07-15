import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Ad } from "../types";
import { cover, onImgError } from "../utils/img";

interface HeroCarouselProps {
  ads: Ad[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredAds = ads.slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredAds.length]);

  if (featuredAds.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % featuredAds.length);
  const prev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + featuredAds.length) % featuredAds.length,
    );

  const currentAd = featuredAds[currentIndex];

  return (
    <div className="relative w-full h-[450px] md:h-[650px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-brand-border shadow-2xl group glow-purple">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={cover(currentAd.images)}
            onError={onImgError}
            alt={currentAd.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-brand-bg via-brand-bg/60 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-6 md:px-16 md:max-w-3xl space-y-4 md:space-y-6 pb-16 md:pb-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md"
                style={{ background: "rgba(168,85,247,0.25)", color: "#e9d5ff", border: "1px solid rgba(168,85,247,0.5)" }}>
                Destaque da Semana
              </span>
              <h2 className="text-3xl md:text-7xl font-black text-white uppercase leading-[0.9] tracking-tighter font-display">
                {currentAd.title}
              </h2>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 text-sm md:text-xl line-clamp-2 md:line-clamp-3 max-w-xl"
            >
              {currentAd.description}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4"
            >
              <div className="text-2xl md:text-4xl font-black text-brand-green text-glow-lime">
                R$ {Number(currentAd.price).toLocaleString("pt-BR")}
              </div>
              <Link
                to={`/ads/${currentAd.id}`}
                className="bg-brand-primary hover:bg-brand-primary-light text-black h-10 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl transition-all duration-300 font-black uppercase text-xs md:text-sm tracking-widest flex items-center gap-2 shadow-xl shadow-white/10"
              >
                VER DETALHES
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-primary hover:text-black"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-primary hover:text-black"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredAds.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? "w-8 bg-brand-primary" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
