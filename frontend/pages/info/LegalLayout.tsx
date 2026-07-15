import React, { useEffect } from "react";
import { motion } from "motion/react";
import CornerBrackets from "../../components/CornerBrackets";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  updatedAt: string;
  docTitle?: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, subtitle, updatedAt, docTitle, children }) => {
  useEffect(() => {
    if (docTitle) document.title = docTitle;
    return () => {
      document.title = "Fronteira Airsoft | A Elite do Airsoft Brasil";
    };
  }, [docTitle]);

  return (
    <div className="min-h-screen pb-24">
      <section className="relative py-16 overflow-hidden border-b border-brand-border">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/10 to-transparent" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-brand-card/60 border border-brand-border tactical-panel p-8"
          >
            <CornerBrackets corners={["tr", "bl"]} color="var(--color-brand-purple)" size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary-light mb-3">
              Documento Oficial
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-3">
              {title}
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">{subtitle}</p>
            <p className="mt-5 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              Última atualização: {updatedAt}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 mt-12">
        <div className="space-y-8 text-gray-300 leading-relaxed text-sm md:text-[15px]">{children}</div>
      </section>
    </div>
  );
};

export const LegalSection: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div>
    <h2 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tight mb-3">
      <span className="text-brand-primary font-mono text-sm">{String(n).padStart(2, "0")}</span>
      {title}
    </h2>
    <div className="space-y-3 text-gray-400">{children}</div>
  </div>
);

export default LegalLayout;
