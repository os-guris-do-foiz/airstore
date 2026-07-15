import React from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../utils/favorites";
import { isLoggedIn } from "../utils/auth";
import { toast } from "../utils/toast";

interface FavoriteButtonProps {
  adId: string;
  size?: "sm" | "md";
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ adId, size = "sm", className = "" }) => {
  const { isFavorited, toggle } = useFavorites();
  const fav = isFavorited(adId);
  const icon = size === "md" ? 18 : 14;

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      toast.error("Faça login para salvar favoritos.");
      return;
    }
    try {
      const now = await toggle(adId);
      toast.success(now ? "Salvo nos favoritos." : "Removido dos favoritos.");
    } catch {
      toast.error("Não foi possível atualizar o favorito.");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
      title={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={`tactical-panel-xs flex items-center justify-center backdrop-blur-md border transition-all ${
        size === "md" ? "w-10 h-10" : "w-7 h-7"
      } ${
        fav
          ? "bg-red-500/20 border-red-500/60 text-red-500"
          : "bg-black/60 border-white/10 text-white hover:text-red-400 hover:border-red-400/50"
      } ${className}`}
    >
      <Heart size={icon} fill={fav ? "currentColor" : "none"} className={fav ? "scale-110 transition-transform" : "transition-transform"} />
    </button>
  );
};

export default FavoriteButton;
