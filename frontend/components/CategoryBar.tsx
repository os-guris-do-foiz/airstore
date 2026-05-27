import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Crosshair,
  Shield,
  Hammer,
  Box,
  Package,
  Layers,
} from "lucide-react";

const categories = [
  { name: "Fuzil", icon: Target, path: "/ads?model=Fuzil" },
  { name: "Pistola", icon: Shield, path: "/ads?model=Pistola" },
  { name: "Sniper", icon: Crosshair, path: "/ads?model=Sniper" },
  { name: "AEG", icon: Target, path: "/ads?type=AEG" },
  { name: "GBB", icon: Crosshair, path: "/ads?type=GBB" },
  { name: "Serviços", icon: Hammer, path: "/ads?category=Serviços" },
  { name: "Kits", icon: Box, path: "/ads?category=Kits" },
  { name: "Combos", icon: Layers, path: "/ads?category=Combos" },
  { name: "Peças", icon: Package, path: "/ads?category=Peças" },
];

const CategoryBar: React.FC = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar py-4">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          to={cat.path}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-card border border-gray-800 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary-light transition-all duration-300 shadow-lg">
            <cat.icon
              size={24}
              className="text-gray-400 group-hover:text-black transition-colors"
            />
          </div>
          <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-wider transition-colors">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default CategoryBar;
