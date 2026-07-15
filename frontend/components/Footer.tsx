import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Bug } from "lucide-react";
import ReportModal from "./modals/ReportModal";

const Footer: React.FC = () => {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <footer className="bg-brand-card border-t border-brand-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-bold">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">
              FRONTEIRA<span className="text-brand-primary-light">AIRSOFT</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm">
            A fronteira definitiva para entusiastas de Airsoft. Encontre
            equipamentos, serviços e times.
          </p>
          <div className="tactical-panel-sm bg-brand-bg/50 border border-brand-border p-4 flex items-center gap-4 max-w-sm">
            <div className="tactical-panel-xs w-10 h-10 bg-red-500/10 flex items-center justify-center text-red-500">
              <Heart size={20} className="fill-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                Apoie o Projeto
              </p>
              <Link
                to="/about"
                className="text-xs font-bold text-white hover:text-brand-primary-light transition-colors block"
              >
                Este site sobrevive de doações. Saiba mais →
              </Link>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Plataforma</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <Link to="/ads" className="hover:text-white">
                Anúncios
              </Link>
            </li>
            <li>
              <Link to="/ads?category=Serviços" className="hover:text-white">
                Serviços
              </Link>
            </li>
            <li>
              <Link to="/teams" className="hover:text-white">
                Times & Grupos
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">
                Sobre o Projeto
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Suporte</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <Link to="/terms" className="hover:text-white">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white">
                Privacidade
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">
                Contato
              </Link>
            </li>
            <li>
              <button 
                onClick={() => setIsBugModalOpen(true)}
                className="hover:text-white flex items-center gap-2 transition-colors"
                id="report-system-bug-btn"
              >
                <Bug size={14} /> Reportar Erro
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Newsletter</h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="input-field w-full text-sm"
            />
            <button className="btn-primary text-sm">Assinar</button>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-border mt-12 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Fronteira Airsoft. Todos os direitos
        reservados.
      </div>
    </div>

    <ReportModal
      isOpen={isBugModalOpen}
      onClose={() => setIsBugModalOpen(false)}
      targetId="SYSTEM"
      type="SYSTEM"
      title="Plataforma Fronteira Airsoft"
    />
  </footer>
);
};

export default Footer;
