import React, { useState } from "react";
import { Heart, X, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

const DonationWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60]"
        >
          <div className="relative group">
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 text-gray-400 rounded-full flex items-center justify-center hover:text-white hover:bg-gray-700 transition-colors border border-white/5 opacity-100 sm:opacity-0 group-hover:opacity-100 z-20 shadow-lg"
            >
              <X size={10} className="sm:w-3 sm:h-3" />
            </button>

            <Link
              to="/about"
              className="block bg-brand-card/90 backdrop-blur-xl border border-white/10 p-2.5 sm:p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-brand-primary/50 transition-all group/card overflow-hidden"
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />

              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 group-hover/card:scale-110 transition-transform shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart size={16} className="fill-red-500 sm:w-5 sm:h-5" />
                  </motion.div>
                </div>
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">
                    Apoie o Projeto
                  </span>
                  <span className="text-xs font-bold text-white">
                    Apoie nossa evolução
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationWidget;
