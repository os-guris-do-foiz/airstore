import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, Lock, Hash, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { authApi } from "../../api/auth";
import { toast } from "../../utils/toast";
import CornerBrackets from "../../components/CornerBrackets";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const requestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword(email);
      toast.info(res.message);
      setStep(2);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Não foi possível enviar o código.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(email, code.trim(), newPassword);
      toast.success(res.message);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all";

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="tactical-panel w-full max-w-md bg-brand-card p-8 md:p-10 border border-brand-border shadow-2xl relative z-10 backdrop-blur-xl">
        <CornerBrackets corners={["tr", "bl"]} size={18} />
        <div className="text-center space-y-4 mb-8">
          <div className="tactical-panel-sm w-16 h-16 bg-brand-bg border border-brand-primary/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(225,255,0,0.2)]">
            <KeyRound size={32} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Recuperar Senha
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {step === 1
                ? "Informe o e-mail da conta para receber o código de recuperação."
                : "Digite o código recebido por e-mail e escolha a nova senha."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= s ? "bg-brand-primary shadow-[0_0_8px_rgba(198,255,46,0.5)]" : "bg-brand-border"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-5" onSubmit={requestCode}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                E-mail de Cadastro
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="tactical-panel-xs w-full h-14 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>ENVIAR CÓDIGO <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleReset}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Código de 6 dígitos
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className={`${inputClass} tracking-[0.5em] font-black text-brand-primary`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="tactical-panel-xs w-full h-14 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>REDEFINIR SENHA <ArrowRight size={18} /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => requestCode()}
              disabled={loading || cooldown > 0}
              className="tactical-panel-xs w-full h-12 border border-brand-border text-gray-400 hover:text-white hover:border-brand-primary/50 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} />
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
          Lembrou a senha?{" "}
          <Link to="/login" className="text-brand-primary hover:text-white transition-colors ml-1">
            Entrar na Base
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
