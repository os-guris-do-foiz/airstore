import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { mockCampos, Campo } from "../../data/mockCampos";
import { 
  MapPin, ShieldAlert, CheckCircle2, ChevronLeft, 
  Calendar as CalendarIcon, Clock, Users, Lock, Unlock,
  Copy, Check, Info, ArrowRight, Home, X, MessageCircle, Flag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReportModal from "../../components/modals/ReportModal";

type SlotStatus = "available" | "public" | "private";

interface PlayerReservation {
  id: string;
  name: string;
  companions: number; // Removed companions handling for simplicity of the generated list, but kept prop to not break state
  needsRental: boolean;
}

interface TimeSlot {
  id: string;
  time: string;
  status: SlotStatus;
  currentPlayers: number;
  maxPlayers: number;
  reservations: PlayerReservation[];
  inviteLink?: string;
}

const CampoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campo, setCampo] = useState<Campo | null>(null);

  // Date selection
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Slots
  const [slotsByDate, setSlotsByDate] = useState<Record<string, TimeSlot[]>>({});
  
  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(0); 
  const [bookingType, setBookingType] = useState<"public" | "private">("public");
  
  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    needsRental: false,
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWpp, setCopiedWpp] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const found = mockCampos.find((c) => c.id === id);
    if (found) setCampo(found);

    // Generate next 14 days
    const nextDates = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(new Date().getDate() + i);
      return d;
    });
    setDates(nextDates);
    setSelectedDate(nextDates[0]);
  }, [id]);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    
    // Auto-generate some mock slots for this date if it doesn't have them
    if (!slotsByDate[dateStr]) {
      // Create some fake deterministic variation based on the date
      const dayOfWeek = selectedDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const newSlots: TimeSlot[] = isWeekend ? [
        { id: "s1", time: "08:00 - 12:00", status: "public", currentPlayers: 2, maxPlayers: 50, reservations: [
          { id: "r1", name: "Hisham", companions: 0, needsRental: false },
          { id: "r2", name: "Taim", companions: 0, needsRental: true }
        ] },
        { id: "s2", time: "13:00 - 17:00", status: "private", currentPlayers: 20, maxPlayers: 50, reservations: [] },
        { id: "s3", time: "18:00 - 22:00", status: "available", currentPlayers: 0, maxPlayers: 50, reservations: [] },
      ] : [
        { id: "s1", time: "18:00 - 22:00", status: "available", currentPlayers: 0, maxPlayers: 30, reservations: [] },
        { id: "s2", time: "22:00 - 02:00", status: "available", currentPlayers: 0, maxPlayers: 30, reservations: [] },
      ];

      setSlotsByDate(prev => ({ ...prev, [dateStr]: newSlots }));
    }
  }, [selectedDate, slotsByDate]);

  const openBookingModal = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
    setFormData({ name: "", needsRental: false });
    
    if (slot.status === "available") {
      setBookingStep(1); // Selection between public/private
    } else if (slot.status === "public") {
      setBookingType("public");
      setBookingStep(2); // Direct to form
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setBookingStep(0);
      setSelectedSlot(null);
    }, 300);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate || !campo) return;

    const dateStr = selectedDate.toISOString().split("T")[0];
    const newReservation: PlayerReservation = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      companions: 0, // Simplified: each person adds themselves via link to form the proper WhatsApp list
      needsRental: formData.needsRental
    };

    setSlotsByDate(prev => {
      const daySlots = prev[dateStr];
      const updatedSlots = daySlots.map(s => {
        if (s.id !== selectedSlot.id) return s;

        return {
          ...s,
          status: bookingType as SlotStatus,
          currentPlayers: bookingType === "private" ? 1 : s.currentPlayers + 1,
          reservations: [...s.reservations, newReservation],
          inviteLink: `http://localhost:3000/campos/${campo.id}?slot=${s.id}` // Simulated share link
        };
      });
      return { ...prev, [dateStr]: updatedSlots };
    });

    setBookingStep(3); // Success step
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`http://localhost:3000/campos/${campo?.id}?slot=${selectedSlot?.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!campo) {
    return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;
  }

  const currentSlots = selectedDate ? slotsByDate[selectedDate.toISOString().split("T")[0]] || [] : [];

  return (
    <div className="min-h-screen font-sans pb-20">
      {/* Detail Hero */}
      <section className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0">
          <img src={campo.image} alt={campo.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent"></div>
        </div>
        
        <div className="absolute top-8 left-4 md:left-8 z-10 flex gap-2">
           <Link to="/campos" className="bg-black/50 hover:bg-brand-primary text-white hover:text-black backdrop-blur-md p-3 rounded-xl transition-all border border-white/10 group">
             <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
           </Link>
        </div>

        <div className="absolute bottom-0 w-full z-10 pb-12 pt-20 px-4 md:px-8 max-w-7xl mx-auto left-0 right-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-brand-primary text-black font-black uppercase text-xs tracking-widest px-3 py-1 rounded-md">
              {campo.type}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            {campo.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-300 font-bold uppercase text-xs tracking-widest">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-primary" />
              {campo.location}
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-brand-primary" />
              R$ {campo.basePrice} (Próprio) / R$ {campo.basePrice + campo.rentalPrice} (Locação)
            </div>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors uppercase"
            >
              <Flag size={14} /> Denunciar Campo
            </button>
          </div>
        </div>
      </section>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={campo.id}
        type="FIELD"
        title={campo.name}
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Rules */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="bg-brand-card rounded-3xl p-6 md:p-10 border border-brand-border">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Visão Geral</h2>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">{campo.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-brand-card rounded-3xl p-6 md:p-8 border border-brand-border">
              <h3 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight mb-6">
                 <ShieldAlert className="text-red-500" /> Regras do Campo
              </h3>
              <ul className="space-y-4">
                {campo.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-400">
                    <span className="text-brand-primary mt-0.5">•</span> 
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-brand-card rounded-3xl p-6 md:p-8 border border-brand-border">
              <h3 className="flex items-center gap-3 text-xl font-black text-white uppercase tracking-tight mb-6">
                 <Home className="text-brand-primary" /> Infraestrutura
              </h3>
              <ul className="space-y-4">
                {campo.infrastructure.map((infra, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-400">
                    <CheckCircle2 size={16} className="text-brand-green shrink-0" /> 
                    <span>{infra}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Scheduling */}
        <div className="lg:col-span-1">
          <div className="bg-brand-card rounded-3xl border border-brand-border p-6 sticky top-24 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <CalendarIcon className="text-brand-primary" /> 
              Agenda de Operações
            </h2>

            {/* Date Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6 -mx-2 px-2">
              {dates.map((date, i) => {
                const isSelected = selectedDate?.toISOString() === date.toISOString();
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                const dayNum = date.getDate();
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-all ${
                      isSelected 
                        ? "bg-brand-primary text-black border-brand-primary" 
                        : "bg-brand-bg text-gray-500 border-brand-border hover:border-gray-600"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black uppercase tracking-widest">{dayName}</span>
                    <span className="text-xl font-black">{dayNum}</span>
                  </button>
                );
              })}
            </div>

            {/* Slots List */}
            <div className="space-y-3">
              {currentSlots.length === 0 ? (
                <div className="text-center py-6 text-gray-600 text-sm italic border border-dashed border-brand-border rounded-xl">
                  Nenhum horário liberado para este dia.
                </div>
              ) : (
                currentSlots.map(slot => (
                  <div key={slot.id} className="bg-brand-bg rounded-2xl p-4 border border-brand-border">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-brand-primary" />
                        <span className="font-mono text-white font-bold">{slot.time}</span>
                      </div>
                      <div className="text-xs uppercase font-black tracking-widest">
                        {slot.status === 'available' && <span className="text-brand-green">Disponível</span>}
                        {slot.status === 'public' && <span className="text-blue-400">Pública</span>}
                        {slot.status === 'private' && <span className="text-red-400">Fechado</span>}
                      </div>
                    </div>

                    {slot.status === 'private' ? (
                      <button disabled className="w-full py-3 bg-red-500/10 text-red-500/50 rounded-xl font-bold text-xs uppercase tracking-widest border border-red-500/20 cursor-not-allowed flex items-center justify-center gap-2">
                        <Lock size={14} /> Somente Convidados
                      </button>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                          <span>Vagas Restantes</span>
                          <span className="text-white">{slot.maxPlayers - slot.currentPlayers} / {slot.maxPlayers}</span>
                        </div>
                        <button 
                          onClick={() => openBookingModal(slot)}
                          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            slot.status === 'available'
                            ? "bg-brand-primary text-black hover:bg-brand-primary-light shadow-lg shadow-white/5"
                            : "bg-blue-500 text-black hover:bg-blue-400 shadow-lg shadow-blue-500/20"
                          }`}
                        >
                          {slot.status === 'available' ? 'Reservar Campo' : 'Entrar na Partida'}
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-card w-full max-w-xl rounded-[2rem] border border-brand-border p-6 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              {/* STEP 1: PUBLIC vs PRIVATE (Only for empty slots) */}
              {bookingStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Novo Jogo</h3>
                    <p className="text-gray-400 text-sm">Este horário está vazio. Você decide como configurar o campo.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setBookingType("public"); setBookingStep(2); }} className="bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 rounded-2xl p-6 text-left group">
                      <Unlock size={24} className="text-blue-400 mb-4" />
                      <h4 className="text-blue-400 font-black uppercase text-lg mb-2">Pública</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">Aberto para outros. R$ {campo.basePrice} por pessoa (Próprio).</p>
                    </button>

                    <button onClick={() => { setBookingType("private"); setBookingStep(2); }} className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-2xl p-6 text-left group">
                      <Lock size={24} className="text-red-400 mb-4" />
                      <h4 className="text-red-400 font-black uppercase text-lg mb-2">Privada</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">Fechado para você e convidados com link exclusivo.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PLAYER INFO FORM */}
              {bookingStep === 2 && (
                <form onSubmit={handleBookingSubmit} className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                       {bookingType === 'private' ? 'Reserva Privada' : 'Alistamento'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      <span className="font-mono text-brand-primary-light">{selectedDate?.toLocaleDateString('pt-BR')} • {selectedSlot.time}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Seu Nome / Callsign</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Ghost, Capitão Price..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Equipamento</label>
                      <select 
                        value={formData.needsRental ? "yes" : "no"}
                        onChange={(e) => setFormData({...formData, needsRental: e.target.value === "yes"})}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-white focus:border-brand-primary outline-none appearance-none"
                      >
                        <option value="no">Tenho equipamento próprio (✓) - R$ {campo.basePrice}</option>
                        <option value="yes">Preciso alugar arma + máscara - R$ {campo.basePrice + campo.rentalPrice}</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-brand-bg border border-brand-border rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-gray-400">
                      <span>Valor Individual:</span>
                      <span className="text-brand-green">R$ {formData.needsRental ? campo.basePrice + campo.rentalPrice : campo.basePrice}</span>
                    </div>
                    {bookingType === 'private' && (
                      <p className="text-[10px] text-gray-500 pt-2 border-t border-brand-border text-center normal-case">
                        Os convidados poderão escolher seu próprio equipamento após acessar o link.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {selectedSlot.status === 'available' && (
                      <button type="button" onClick={() => setBookingStep(1)} className="px-6 py-4 rounded-xl font-bold uppercase text-xs tracking-widest text-gray-400 hover:text-white transition-colors border border-transparent hover:border-brand-border">
                        Voltar
                      </button>
                    )}
                    <button type="submit" className="flex-1 bg-brand-primary text-black hover:bg-brand-primary-light transition-all rounded-xl py-4 font-black uppercase tracking-widest shadow-lg shadow-white/5 flex items-center justify-center gap-2">
                      Confirmar <Check size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SUCCESS */}
              {bookingStep === 3 && (
                <div className="space-y-8 text-center py-4">
                  <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-brand-green" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Confirmado!</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Você está na lista da operação. Seu lugar está garantido.
                    </p>
                  </div>

                  <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 text-left shadow-inner">
                    <div className="flex items-center gap-2 text-brand-primary mb-2">
                       <MessageCircle size={18} />
                       <span className="font-black uppercase tracking-widest text-xs">Convocar Outros Operadores</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                      Compartilhe o link abaixo com seu esquadrão. Cada membro deve acessar o link e registrar seu próprio nome e necessidade de equipamento.
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black border border-brand-border rounded-xl p-3 overflow-hidden">
                        <code className="text-gray-300 font-mono text-[11px] whitespace-nowrap">fronteira.com/invite/{campo.id}/{selectedSlot.id}</code>
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="bg-brand-primary text-black px-5 rounded-xl hover:bg-brand-primary-light transition-colors flex items-center justify-center"
                        title="Copiar Link"
                      >
                        {copiedLink ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                  </div>

                  <button onClick={closeModal} className="w-full bg-transparent border border-brand-border text-white hover:bg-white/5 transition-all rounded-xl py-4 font-black uppercase tracking-widest mt-4">
                    Fechar Painel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampoDetail;
