import React from "react";
import { 
  Users, DollarSign, Calendar as CalendarIcon, Clock, CheckCircle2, 
  Settings, Target, Eye
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data strictly for the Owner Dashboard
const MOCK_PARTIDAS = [
  {
    id: "p1",
    time: "08:00 - 12:00",
    status: "public",
    sold: 45,
    capacity: 50,
    rentalsNeeded: 12,
    revenue: 1650,
    isFinished: true,
  },
  {
    id: "p2",
    time: "14:00 - 18:00",
    status: "private",
    sold: 22,
    capacity: 50,
    rentalsNeeded: 8,
    revenue: 1000, 
    isFinished: false,
    organizer: "Equipe Ghost",
  },
  {
    id: "p3",
    time: "19:00 - 23:00",
    status: "public",
    sold: 15,
    capacity: 50,
    rentalsNeeded: 5,
    revenue: 550,
    isFinished: false,
  }
];

const PainelCampo: React.FC = () => {
  return (
    <div className="min-h-screen font-sans pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-24">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-primary text-black font-black uppercase text-[10px] tracking-widest px-2 py-1 rounded">Painel do Parceiro</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Base Alpha CQB</h1>
          <p className="text-gray-400 mt-2 text-sm">Resumo da Operação • Sexta-Feira, 17/04</p>
        </div>
        
        <div className="flex gap-4">
          <Link to="/campos/c1" className="bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
            <Eye size={16} /> Ver Página Pública
          </Link>
          <Link to="/painel-campo/config" className="bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
            <Settings size={16} /> Ajustes
          </Link>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Users size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Check-ins Previstos</p>
          <p className="text-3xl font-black text-white">82</p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Target size={100} />
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 relative z-10">
            <Target size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Armas para Separar</p>
          <p className="text-3xl font-black text-white relative z-10">25</p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-3xl p-6">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mb-4">
            <DollarSign size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Faturamento Estimado</p>
          <p className="text-3xl font-black text-brand-green">R$ 3.200</p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-3xl p-6">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
            <CalendarIcon size={20} />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Taxa de Ocupação</p>
          <p className="text-3xl font-black text-white">65%</p>
        </div>
      </div>

      {/* Partidas Section */}
      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6">Lista de Operações (Hoje)</h2>
      <div className="space-y-4">
        {MOCK_PARTIDAS.map(partida => (
          <div key={partida.id} className={`bg-brand-card border rounded-3xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between ${partida.isFinished ? 'border-brand-border/50 opacity-50' : 'border-brand-border '}`}>
            
            <div className="flex items-center gap-6">
              <div className="text-center w-24 shrink-0">
                <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Horário</span>
                <span className="block font-mono text-xl font-black text-white">{partida.time.split(' - ')[0]}</span>
                <span className="block font-mono text-sm text-gray-500">{partida.time.split(' - ')[1]}</span>
              </div>
              
              <div className="w-px h-12 bg-white/10 hidden md:block"></div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  {partida.status === 'private' ? (
                    <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Jogo Fechado</span>
                  ) : (
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Partida Aberta</span>
                  )}
                  {partida.isFinished && <span className="bg-brand-border text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest line-through">Encerrado</span>}
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  {partida.status === 'private' ? `Reservado por ${partida.organizer}` : 'Jogo Público'}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto lg:justify-end">
              <div className="bg-brand-bg rounded-xl p-3 border border-brand-border/50 min-w-[120px]">
                <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Users size={12}/> Jogadores</span>
                <span className="block font-black text-white text-lg">{partida.sold} <span className="text-xs text-gray-500 font-normal">/ {partida.capacity}</span></span>
              </div>
              
              <div className="bg-brand-bg rounded-xl p-3 border border-brand-border/50 min-w-[120px]">
                <span className="block text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Target size={12}/> Aluguéis</span>
                <span className="block font-black text-white text-lg text-red-400">{partida.rentalsNeeded} <span className="text-xs text-gray-500 font-normal">Kits</span></span>
              </div>

              <div className="bg-brand-bg rounded-xl p-3 border border-brand-border/50 min-w-[120px]">
                <span className="block text-brand-green text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign size={12}/> Receita</span>
                <span className="block font-black text-brand-green text-lg">R$ {partida.revenue}</span>
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <button 
                disabled={partida.isFinished}
                className={`w-full lg:w-auto px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-black/20 ${partida.isFinished ? 'bg-brand-border text-gray-500 cursor-not-allowed' : 'bg-brand-primary text-black hover:bg-brand-primary-light'}`}
              >
                {partida.isFinished ? 'Fechado' : 'Fazer Check-in'}
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default PainelCampo;
