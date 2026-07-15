import React, { useState } from "react";
import { X, Send, AlertTriangle, Shield, Hammer, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { reportsApi } from "../../api/reports";
import CornerBrackets from "../CornerBrackets";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  type: "AD" | "FIELD" | "USER" | "SYSTEM";
  title: string;
}

const REPORT_REASONS = [
  { id: "fraud", label: "Golpe ou Fraude", icon: Shield },
  { id: "misleading", label: "Não condiz com a realidade", icon: AlertTriangle },
  { id: "broken", label: "Equipamento/Local estragado", icon: Hammer },
  { id: "inappropriate", label: "Conteúdo inapropriado", icon: Shield },
  { id: "other", label: "Outro motivo", icon: Clock },
];

const SYSTEM_REASONS = [
  { id: "bug", label: "Erro Técnico / Bug", icon: Hammer },
  { id: "layout", label: "Problema Visual / Layout", icon: AlertTriangle },
  { id: "slowness", label: "Lentidão do Sistema", icon: Clock },
  { id: "suggestion", label: "Sugestão de Melhoria", icon: Shield },
  { id: "other", label: "Outro Motivo", icon: Clock },
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  type,
  title,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const currentReasons = type === "SYSTEM" ? SYSTEM_REASONS : REPORT_REASONS;
  const isBug = type === "SYSTEM";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Por favor, selecione um motivo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await reportsApi.create({
        target_id: targetId,
        type,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
        setDescription("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao enviar denúncia. Você está logado?");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="tactical-panel relative w-full max-w-lg bg-brand-card border border-brand-border overflow-hidden shadow-2xl"
      >
        <CornerBrackets corners={["tr", "bl"]} size={16} inset={2} />
        <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isBug ? "bg-brand-primary/10" : "bg-red-500/10"}`}>
              {isBug ? (
                <Hammer className="text-brand-primary" size={20} />
              ) : (
                <AlertTriangle className="text-red-500" size={20} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">
                {isBug ? "Reportar Erro" : `Denunciar ${type === "AD" ? "Anúncio" : type === "FIELD" ? "Campo" : "Usuário"}`}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">
                {title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-500" size={32} />
              </div>
              <h4 className="text-xl font-black text-white uppercase">
                {isBug ? "Obrigado pela Ajuda!" : "Denúncia Enviada!"}
              </h4>
              <p className="text-gray-400 font-medium">
                {isBug 
                  ? "Agradecemos por nos ajudar a melhorar o sistema. Nossa equipe técnica irá analisar o relato." 
                  : "Nossa equipe de moderação irá analisar o caso o mais breve possível."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  {isBug ? "Qual o tipo de problema?" : "Qual o motivo principal?"}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {currentReasons.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReason(item.label)}
                      className={`tactical-panel-xs flex items-center gap-3 p-4 border transition-all text-left ${
                        reason === item.label
                          ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                          : "bg-brand-bg border-brand-border text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="text-sm font-bold uppercase tracking-wide">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                  {isBug ? "Descreva o erro encontrado" : "Detalhes adicionais (Opcional)"}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-white font-medium focus:border-brand-primary transition-all min-h-[100px] outline-none"
                  placeholder={isBug ? "O que aconteceu? Como podemos reproduzir o erro?" : "Explique o que aconteceu..."}
                  required={isBug}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !reason}
                className={`tactical-panel-xs w-full h-14 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-brand-primary/5 ${
                  loading || !reason
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-brand-primary text-black hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    {isBug ? "Enviar Relato" : "Enviar Denúncia"}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;
