import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Crown, Ban, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { Ad } from "../types";
import { getWear } from "../utils/wear";
import { cover, thumbOf, onThumbError } from "../utils/img";
import WearScale from "./WearScale";
import CornerBrackets from "./CornerBrackets";
import FavoriteButton from "./FavoriteButton";

interface ProductCardProps {
  ad: Ad;
}

const ProductCard: React.FC<ProductCardProps> = ({ ad }) => {
  const isService = ad.category === "Serviços";
  const wear = getWear(isService ? null : ad.condition);
  const isDonorAd = ad.is_donor && !ad.is_sold;

  const accent = ad.is_donor ? "#eab308" : wear?.color ?? "#7c3aed";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative h-full"
    >
      <div
        className={`pointer-events-none absolute -inset-px tactical-panel-sm transition-opacity duration-300 blur-md ${isDonorAd ? "opacity-50 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{ background: `radial-gradient(60% 60% at 50% 0%, ${accent}55, transparent 70%)` }}
      />

      {isDonorAd && (
        <motion.div
          className="pointer-events-none absolute -inset-px tactical-panel-sm"
          animate={{ boxShadow: ["0 0 0px 0px rgba(234,179,8,0.35)", "0 0 14px 2px rgba(234,179,8,0.55)", "0 0 0px 0px rgba(234,179,8,0.35)"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <Link
        to={`/ads/${ad.id}`}
        className="tactical-panel-sm relative flex flex-col h-full overflow-hidden bg-brand-card border transition-colors duration-300"
        style={{ borderColor: isDonorAd ? "rgba(234,179,8,0.5)" : "var(--color-brand-border)" }}
      >
        <CornerBrackets corners={["tr", "bl"]} color={accent} size={10} thickness={2} inset={0} />

        <div className={isDonorAd ? "h-1 w-full" : "h-[3px] w-full"} style={{ background: `linear-gradient(90deg, ${accent}, transparent 85%)` }} />

        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          <img
            src={thumbOf(cover(ad.images))}
            onError={onThumbError(cover(ad.images))}
            alt={ad.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${ad.is_sold ? "grayscale opacity-40" : ""}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-brand-card/20 to-transparent" />

          {ad.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-2xl rotate-[-8deg] border-2 border-white/20">
                <Ban size={16} />
                Vendido
              </div>
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 z-10">
            <div className="flex flex-col gap-1.5">
              {isDonorAd && (
                <motion.span
                  animate={{ opacity: [1, 0.75, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-fit flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 tactical-panel-xs backdrop-blur-md"
                  style={{ background: "rgba(0,0,0,0.7)", color: "#eab308", border: "1px solid rgba(234,179,8,0.6)" }}
                >
                  <Crown size={9} fill="currentColor" /> Doador
                </motion.span>
              )}
              {wear && <WearScale wear={wear} size="sm" />}
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="tactical-panel-xs flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest border border-white/10">
                {isService ? <Wrench size={9} /> : null}
                {isService ? "Serviço" : ad.type}
              </span>
              <FavoriteButton adId={ad.id} size="sm" />
            </div>
          </div>

          {wear && !ad.is_sold && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] z-10" style={{ background: wear.color, boxShadow: `0 0 6px ${wear.color}` }} />
          )}
        </div>

        <div className="p-3 flex flex-col flex-1 gap-2">
          <div className="space-y-0.5">
            <h3
              className={`font-display font-bold line-clamp-1 text-sm leading-tight transition-colors ${ad.is_sold ? "text-gray-500 line-through" : "text-white group-hover:text-brand-primary"}`}
            >
              {ad.title}
            </h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-purple-light/80 truncate">
              {!isService && ad.model && ad.model !== "N/A" ? `${ad.model} · ${ad.brand}` : ad.category}
            </p>
          </div>

          <div className="mt-auto pt-2 border-t border-brand-border/70 flex items-center justify-between gap-2">
            <div className={`text-lg font-black tracking-tight ${ad.is_sold ? "text-gray-600" : "text-brand-green"}`}>
              <span className="text-[10px] align-top mr-0.5 opacity-70">R$</span>
              {Number(ad.price).toLocaleString("pt-BR")}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-[9px] uppercase font-black">
              <MapPin size={10} className={ad.is_sold ? "text-gray-600" : "text-brand-purple-light"} />
              <span className="max-w-[70px] truncate">{ad.location?.split(",")[0]}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
