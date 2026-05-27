import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, X, ArrowRight } from "lucide-react";
import { Field } from "../../types/fields";
import { Link } from "react-router-dom";

interface MapaCamposProps {
  fields: Field[];
}

const MapaCampos: React.FC<MapaCamposProps> = ({ fields }) => {
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-brand-bg border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Stylized Map Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Map Pins */}
      <div className="relative w-full h-full p-12">
        {fields.map((field, index) => (
          <motion.button
            key={field.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedField(field)}
            className="absolute group"
            style={{
              left: `${20 + index * 30}%`,
              top: `${30 + index * 20}%`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-brand-primary text-black p-2 rounded-xl shadow-lg shadow-white/10 group-hover:scale-125 transition-transform duration-300">
                <MapPin size={24} />
              </div>
              <div className="mt-2 bg-brand-card/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {field.name}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Field Overlay Card */}
      <AnimatePresence>
        {selectedField && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 bottom-6 w-80 bg-brand-card/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 z-20 flex flex-col"
          >
            <button
              onClick={() => setSelectedField(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex-1 space-y-4">
              <div className="h-32 rounded-2xl overflow-hidden">
                <img
                  src={selectedField.photos[0]}
                  alt={selectedField.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {selectedField.name}
                </h3>
                <p className="text-brand-primary-light text-xs font-bold uppercase tracking-widest mt-1">
                  {selectedField.city}
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-white/5">
                <span className="text-gray-500 text-xs uppercase font-black">
                  Preço
                </span>
                <span className="text-brand-green font-black">
                  R$ {selectedField.price.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to={`/campos/${selectedField.id}`}
              className="mt-6 w-full bg-brand-primary hover:bg-brand-primary-light text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
              Ver Campo
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 bg-brand-card/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Mapa Interativo de Operações
        </p>
      </div>
    </div>
  );
};

export default MapaCampos;
