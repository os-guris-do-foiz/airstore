import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import CornerBrackets from "./CornerBrackets";
import { MODEL_OPTIONS, TYPE_OPTIONS, CATEGORY_OPTIONS } from "../utils/adOptions";

const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 md:min-w-[160px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`tactical-panel-sm w-full h-14 px-5 flex items-center justify-between bg-brand-bg/40 border transition-all duration-300 group ${
          isOpen
            ? "border-brand-primary ring-4 ring-brand-primary/10"
            : "border-gray-800 hover:border-gray-700"
        }`}
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
            {label}
          </span>
          <span
            className={`text-sm font-bold truncate ${value ? "text-white" : "text-gray-400"}`}
          >
            {value || "Selecionar"}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-primary" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="tactical-panel-sm absolute top-full left-0 right-0 mt-2 bg-brand-card border border-gray-800 overflow-hidden shadow-2xl z-50 backdrop-blur-xl"
          >
            <div className="p-2 max-h-60 overflow-y-auto no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                Todos
              </button>
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    value === opt
                      ? "bg-brand-primary text-black shadow-lg shadow-white/10"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (model) params.append("model", model);
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    navigate(`/ads?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto -mt-10 md:-mt-14 relative z-20 px-4">
      <form
        onSubmit={handleSearch}
        className="tactical-panel relative bg-brand-card/80 backdrop-blur-2xl p-3 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row gap-3 items-stretch"
      >
        <CornerBrackets corners={["tr", "bl"]} size={16} />
        <div className="tactical-panel-sm flex-1 relative group bg-brand-bg/40 border border-gray-800 hover:border-gray-700 transition-all focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary transition-colors"
            size={22}
          />
          <input
            type="text"
            placeholder="O que você está procurando hoje?"
            className="w-full bg-transparent border-none focus:ring-0 text-white pl-14 h-14 text-base md:text-lg placeholder:text-gray-600 font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-3">
          <CustomDropdown
            label="Modelo"
            options={MODEL_OPTIONS}
            value={model}
            onChange={setModel}
          />

          <CustomDropdown
            label="Sistema"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />

          <CustomDropdown
            label="Categoria"
            options={CATEGORY_OPTIONS.map((c) => c.value)}
            value={category}
            onChange={setCategory}
          />

          <button
            type="submit"
            className="tactical-panel-sm bg-brand-primary hover:bg-brand-primary-light text-black h-14 px-8 transition-all duration-300 font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-95 group"
          >
            <Search
              size={22}
              className="group-hover:scale-110 transition-transform"
            />
            <span>BUSCAR</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
