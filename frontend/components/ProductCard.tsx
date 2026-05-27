import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Crown, Ban } from "lucide-react";
import { motion } from "motion/react";
import { Ad } from "../types";

interface ProductCardProps {
  ad: Ad;
}

const ProductCard: React.FC<ProductCardProps> = ({ ad }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`bg-brand-card rounded-xl overflow-hidden border ${ad.is_sold ? "border-red-500/50" : ad.is_donor ? "border-yellow-500/30" : "border-gray-800"} group flex flex-col h-full shadow-lg transition-all duration-300 relative`}
    >
      <Link to={`/ads/${ad.id}`} className="flex flex-col h-full">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={ad.images[0]}
            alt={ad.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${ad.is_sold ? "grayscale opacity-50" : ""}`}
            referrerPolicy="no-referrer"
          />

          {ad.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-2xl rotate-[-10deg] border-2 border-white/20">
                <Ban size={16} />
                Vendido
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
            {ad.is_donor && !ad.is_sold && (
              <span className="bg-yellow-500 text-black text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                <Crown size={8} fill="currentColor" />
                Doador
              </span>
            )}
            <span className="bg-brand-primary text-black text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest">
              {ad.type}
            </span>
            {ad.category !== "Serviços" && ad.condition && ad.condition !== "N/A" && (
              <span className="bg-gray-900/90 text-white text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest border border-gray-700 max-w-[80px] truncate" title={ad.condition}>
                {ad.condition}
              </span>
            )}
            {ad.category === "Serviços" && (
                <span className="bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30 text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest shadow-lg shadow-brand-primary/10">
                  Serviços
                </span>
            )}
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1 space-y-2">
          <div className="space-y-0.5">
            <h3
              className={`font-bold line-clamp-1 transition-colors text-sm leading-tight ${ad.is_sold ? "text-gray-500 line-through" : "text-white group-hover:text-brand-primary-light"}`}
            >
              {ad.title}
            </h3>
            <p className="text-brand-primary-light text-[9px] font-black uppercase tracking-widest opacity-80">
              {ad.category !== "Serviços" && ad.model !== "N/A" ? `${ad.model} • ${ad.brand}` : ad.category}
            </p>
          </div>

          <div className="mt-auto pt-2 border-t border-gray-800/50 flex items-center justify-between">
            <div
              className={`text-lg font-black tracking-tighter ${ad.is_sold ? "text-gray-600" : "text-brand-green"}`}
            >
              R$ {ad.price.toLocaleString("pt-BR")}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-[9px] uppercase font-black">
              <MapPin
                size={10}
                className={ad.is_sold ? "text-gray-600" : "text-brand-primary"}
              />
              <span className="max-w-[70px] truncate">
                {ad.location.split(",")[0]}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
