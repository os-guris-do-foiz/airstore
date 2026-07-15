import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-brand-border text-gray-400 hover:text-white hover:border-brand-primary/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:border-brand-border text-xs font-black uppercase tracking-widest transition-colors"
      >
        <ChevronLeft size={14} /> Anterior
      </button>
      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
        Página {page} de {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-brand-border text-gray-400 hover:text-white hover:border-brand-primary/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:border-brand-border text-xs font-black uppercase tracking-widest transition-colors"
      >
        Próxima <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;
