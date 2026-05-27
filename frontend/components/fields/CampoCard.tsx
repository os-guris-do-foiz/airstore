import React from "react";
import { Link } from "react-router-dom";
import { MapPin, DollarSign, ArrowRight } from "lucide-react";
import { Field } from "../../types/fields";

interface CampoCardProps {
  field: Field;
}

const CampoCard: React.FC<CampoCardProps> = ({ field }) => {
  return (
    <div className="bg-brand-card border border-white/5 rounded-[2rem] overflow-hidden group hover:border-brand-primary/50 transition-all duration-500">
      <div className="relative h-48 overflow-hidden">
        <img
          src={field.photos[0]}
          alt={field.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-card to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4">
          <span className="bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {field.city}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-brand-primary-light transition-colors">
            {field.name}
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <MapPin size={14} />
            <span className="truncate">{field.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-1 text-brand-green font-black">
            <DollarSign size={16} />
            <span>
              {field.price.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-[10px] text-gray-500 uppercase ml-1">
              / jogo
            </span>
          </div>

          <Link
            to={`/campos/${field.id}`}
            className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group/btn"
          >
            Ver Campo
            <ArrowRight
              size={16}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampoCard;
