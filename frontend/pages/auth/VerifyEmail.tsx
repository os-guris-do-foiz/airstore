import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck, Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { authApi } from "../../api/auth";
import { toast } from "../../utils/toast";
import CornerBrackets from "../../components/CornerBrackets";

const CODE_LENGTH = 6;

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>((location.state as any)?.email || "");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "");
    const next = [...digits];

    if (v.length > 1) {
      v.slice(0, CODE_LENGTH).split("").forEach((ch, i) => {
        if (index + i < CODE_LENGTH) next[index + i] = ch;
      });
      setDigits(next);
      inputsRef.current[Math.min(index + v.length, CODE_LENGTH - 1)]?.focus();
      return;
    }

    next[index] = v;
    setDigits(next);
    if (v && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const code = digits.join("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || code.length < CODE_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(email, code);
      toast.success("E-mail verificado! Faça login para entrar na base.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Não foi possível verificar o código.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Informe o e-mail cadastrado para reenviar o código.");
      return;
    }
    setResending(true);
    setError(null);
    try {
      const res = await authApi.resendCode(email);
      toast.success(res.message);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Não foi possível reenviar o código.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="tactical-panel w-full max-w-md bg-brand-card p-8 md:p-10 border border-brand-border shadow-2xl relative z-10 backdrop-blur-xl">
        <CornerBrackets corners={["tr", "bl"]} size={18} />
        <div className="text-center space-y-4 mb-8">
          <div className="tactical-panel-sm w-16 h-16 bg-brand-bg border border-brand-primary/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(225,255,0,0.2)]">
            <MailCheck size={32} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Verificar E-mail
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Enviamos um código de 6 dígitos para o seu e-mail.
              Confira também a caixa de spam.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleVerify}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              E-mail Cadastrado
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              Código de Verificação
            </label>
            <div className="flex gap-2 justify-between">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  className="tactical-panel-xs w-12 h-14 text-center text-xl font-black text-brand-primary bg-brand-bg/50 border border-brand-border focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length < CODE_LENGTH}
            className="tactical-panel-xs w-full h-14 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>CONFIRMAR CÓDIGO <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="tactical-panel-xs w-full mt-4 h-12 border border-brand-border text-gray-400 hover:text-white hover:border-brand-primary/50 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {resending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <RefreshCw size={14} />
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
            </>
          )}
        </button>

        <div className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
          Já verificou?{" "}
          <Link to="/login" className="text-brand-primary hover:text-white transition-colors ml-1">
            Entrar na Base
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
