import React from "react";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { Field } from "../../types/fields";

interface AgendaCampoProps {
  field: Field;
  onSelectSlot: (day: string, slot: string) => void;
}

const AgendaCampo: React.FC<AgendaCampoProps> = ({ field, onSelectSlot }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            Agenda do Campo
          </h3>
          <p className="text-xs text-gray-500 uppercase font-black tracking-widest">
            Selecione um horário para ver as listas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {field.schedules.map((schedule) => (
          <div
            key={schedule.day}
            className="bg-brand-card/50 border border-white/5 rounded-3xl p-6 space-y-4"
          >
            <h4 className="text-white font-black uppercase tracking-widest border-b border-white/5 pb-3">
              {schedule.day}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {schedule.slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => onSelectSlot(schedule.day, slot)}
                  className="flex items-center justify-between px-4 py-3 bg-brand-bg/50 border border-white/5 rounded-xl text-gray-400 hover:text-white hover:border-brand-primary/50 hover:bg-brand-primary/10 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-brand-primary" />
                    <span className="font-bold">{slot}</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaCampo;
