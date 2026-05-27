import React, { useState } from "react";
import { 
  Settings, Image as ImageIcon, MapPin, DollarSign, Clock, 
  Plus, Trash2, CheckCircle2, Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const PainelCampoConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"info" | "prices" | "schedule">("info");

  // Mock State
  const [rules, setRules] = useState(["Óculos de proteção obrigatório", "Proibido atirar na safe zone"]);
  const [newRule, setNewRule] = useState("");

  const addRule = () => {
    if(newRule.trim()) {
      setRules([...rules, newRule]);
      setNewRule("");
    }
  };

  const removeRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen font-sans pb-20 px-4 md:px-8 max-w-5xl mx-auto pt-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-primary text-black font-black uppercase text-[10px] tracking-widest px-2 py-1 rounded">Ajustes do Campo</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Configurações</h1>
          <p className="text-gray-400 mt-2 text-sm">Atualize os dados e a vitrine do seu campo para os jogadores.</p>
        </div>
        <Link to="/painel-campo" className="bg-brand-bg border border-brand-border text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
          Voltar ao Painel
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab("info")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${activeTab === "info" ? 'bg-brand-primary text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={18} /> Dados Básicos
          </button>
          <button 
            onClick={() => setActiveTab("prices")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${activeTab === "prices" ? 'bg-brand-primary text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <DollarSign size={18} /> Valores Mestre
          </button>
          <button 
            onClick={() => setActiveTab("schedule")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors ${activeTab === "schedule" ? 'bg-brand-primary text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Clock size={18} /> Grade de Horários
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-brand-card border border-brand-border rounded-[2rem] p-6 lg:p-10 shadow-2xl">
          
          {/* TAB 1: INFO BÁSICA */}
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-xl font-black text-white uppercase tracking-tight border-b border-brand-border pb-4">Apresentação Pública</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Foto de Capa do Campo</label>
                  <div className="w-full h-48 border-2 border-dashed border-brand-border hover:border-brand-primary/50 transition-colors rounded-2xl bg-brand-bg/50 flex flex-col items-center justify-center text-gray-500 cursor-pointer group">
                    <ImageIcon size={32} className="mb-2 group-hover:text-brand-primary transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest">Clique para enviar imagem</span>
                    <span className="text-[10px] mt-1 text-gray-600">Recomendado: 1920x1080 (Horizontal)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Nome do Campo</label>
                    <input type="text" defaultValue="Base Alpha CQB" className="w-full bg-brand-bg border border-brand-border rounded-xl h-12 px-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Link Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input type="url" defaultValue="https://maps.google.com/?q=..." className="w-full bg-brand-bg border border-brand-border rounded-xl h-12 pl-10 pr-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Descrição</label>
                  <textarea rows={4} defaultValue="O maior campo CQB da região. Mais de 2000m² de área construída..." className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none resize-none" />
                </div>
              </div>
              
              <h2 className="text-xl font-black text-white uppercase tracking-tight border-b border-brand-border pb-4 mt-12">Regras da Casa</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newRule} 
                    onChange={e => setNewRule(e.target.value)} 
                    placeholder="Ex: FPS Máximo 400" 
                    className="flex-1 bg-brand-bg border border-brand-border rounded-xl h-12 px-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none" 
                  />
                  <button onClick={addRule} className="h-12 px-6 bg-brand-primary text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-primary-light transition-colors">Adicionar</button>
                </div>
                <div className="space-y-2">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-brand-bg border border-brand-border rounded-xl p-4 group">
                      <div className="flex items-center gap-3">
                        <Shield className="text-brand-primary" size={16} />
                        <span className="text-gray-300 text-sm">{rule}</span>
                      </div>
                      <button onClick={() => removeRule(idx)} className="text-gray-600 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREÇOS */}
          {activeTab === 'prices' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <h2 className="text-xl font-black text-white uppercase tracking-tight border-b border-brand-border pb-4 flex items-center gap-2">
                Valores Base Diários
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Estes valores serão usados no momento que um jogador interagir com o agendamento da sua arena no site.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-bg p-6 rounded-2xl border border-brand-border">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Jogador Padrão</h3>
                  <p className="text-gray-500 text-xs mb-4">Tem marcador e fardamento próprio.</p>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Valor da Entrada (R$)</label>
                  <input type="number" defaultValue="20" className="w-full bg-brand-card border border-brand-border rounded-xl h-12 px-4 text-white text-lg font-mono focus:border-brand-primary outline-none" />
                </div>

                <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/30">
                  <h3 className="text-brand-primary font-black uppercase tracking-widest text-sm mb-1">Pacote Aluguel</h3>
                  <p className="text-gray-400 text-xs mb-4">Precisa locar Marcador + Máscara + Bolinhas.</p>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Valor do Pacote (R$)</label>
                  <input type="number" defaultValue="70" className="w-full bg-brand-card border border-brand-border rounded-xl h-12 px-4 text-white text-lg font-mono focus:border-brand-primary outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGENDAS */}
          {activeTab === 'schedule' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center border-b border-brand-border pb-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Grade Fixa Semanal</h2>
                <button className="text-brand-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-brand-primary-light">
                  <Plus size={16}/> Novo Dia de Operação
                </button>
              </div>

              <div className="space-y-6">
                {/* Exemplo de dia configurado */}
                <div className="bg-brand-bg border border-brand-border rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
                       Sexta-Feira
                    </h3>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="col-span-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Início - Fim</label>
                        <input type="text" defaultValue="08:00 - 12:00" className="w-full bg-brand-card border border-brand-border rounded-xl h-10 px-3 text-white text-sm font-mono focus:border-brand-primary outline-none" />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Vagas</label>
                        <input type="number" defaultValue="50" className="w-full bg-brand-card border border-brand-border rounded-xl h-10 px-3 text-white text-sm font-mono focus:border-brand-primary outline-none" />
                      </div>
                       <div className="col-span-1 flex justify-end">
                         <button className="text-gray-500 hover:text-red-500 p-2 mt-4"><Trash2 size={18}/></button>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="col-span-1">
                        <input type="text" defaultValue="14:00 - 18:00" className="w-full bg-brand-card border border-brand-border rounded-xl h-10 px-3 text-white text-sm font-mono focus:border-brand-primary outline-none" />
                      </div>
                      <div className="col-span-1">
                        <input type="number" defaultValue="50" className="w-full bg-brand-card border border-brand-border rounded-xl h-10 px-3 text-white text-sm font-mono focus:border-brand-primary outline-none" />
                      </div>
                       <div className="col-span-1 flex justify-end">
                         <button className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                       </div>
                    </div>

                    <button className="w-full py-2 border border-dashed border-gray-700 text-gray-500 rounded-xl text-[10px] font-bold uppercase tracking-widest mt-2 hover:border-brand-primary hover:text-brand-primary transition-colors">
                      + Adicionar Turno
                    </button>
                  </div>
                </div>

                 {/* Outro dia (Desativado) */}
                 <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 opacity-60 grayscale">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-400 font-black uppercase tracking-widest text-lg flex items-center gap-2">
                       Sábado
                    </h3>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                      </label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-10 pt-6 border-t border-brand-border flex justify-end">
            <button className="bg-brand-primary text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-primary-light transition-colors flex items-center gap-2 shadow-lg shadow-brand-primary/20">
              <CheckCircle2 size={18} /> Salvar Configurações
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PainelCampoConfig;
