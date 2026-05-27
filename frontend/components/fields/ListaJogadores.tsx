import React from "react";
import { Users, Shield, Package, UserPlus, MessageSquare } from "lucide-react";
import { GameList } from "../../types/fields";

interface ListaJogadoresProps {
  list: GameList;
  onJoin: () => void;
}

const ListaJogadores: React.FC<ListaJogadoresProps> = ({ list, onJoin }) => {
  const stats = list.participants.reduce(
    (acc, p) => {
      acc.total += p.peopleCount;
      if (p.hasOwnGear) acc.withGear += p.peopleCount;
      if (p.needsRental) acc.renting += p.peopleCount;
      return acc;
    },
    { total: 0, withGear: 0, renting: 0 },
  );

  return (
    <div className="bg-brand-card border border-white/5 rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-brand-primary/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${list.type === "public" ? "bg-brand-green/20 text-brand-green" : "bg-brand-primary/20 text-brand-primary-light"}`}
              >
                Lista {list.type === "public" ? "Pública" : "Privada"}
              </span>
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                • {list.date} às {list.time}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              {list.name}
            </h3>
          </div>

          <button
            onClick={onJoin}
            className="bg-brand-primary hover:bg-brand-primary-light text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2 active:scale-95"
          >
            <UserPlus size={18} />
            Entrar na Lista
          </button>
        </div>

        {list.observation && (
          <div className="mt-6 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl flex gap-3">
            <MessageSquare
              size={16}
              className="text-brand-primary shrink-0 mt-1"
            />
            <p className="text-sm text-gray-400 italic">"{list.observation}"</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-brand-bg/50 border border-white/5 p-4 rounded-2xl text-center">
            <div className="text-white font-black text-2xl">{stats.total}</div>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1 mt-1">
              <Users size={10} /> Jogadores
            </div>
          </div>
          <div className="bg-brand-bg/50 border border-white/5 p-4 rounded-2xl text-center">
            <div className="text-white font-black text-2xl">
              {stats.withGear}
            </div>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1 mt-1">
              <Shield size={10} /> Com Arma
            </div>
          </div>
          <div className="bg-brand-bg/50 border border-white/5 p-4 rounded-2xl text-center">
            <div className="text-white font-black text-2xl">
              {stats.renting}
            </div>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center justify-center gap-1 mt-1">
              <Package size={10} /> Alugando
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-4">
        <h4 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">
          Participantes Confirmados
        </h4>
        <div className="space-y-3">
          {list.participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 bg-brand-bg/30 border border-white/5 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold">{p.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                    {p.peopleCount} {p.peopleCount > 1 ? "pessoas" : "pessoa"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {p.hasOwnGear && (
                  <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary-light text-[8px] font-black uppercase tracking-widest rounded border border-brand-primary/20">
                    Equip. Próprio
                  </span>
                )}
                {p.needsRental && (
                  <span className="px-2 py-1 bg-brand-green/10 text-brand-green text-[8px] font-black uppercase tracking-widest rounded border border-brand-green/20">
                    Vai Alugar
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListaJogadores;
