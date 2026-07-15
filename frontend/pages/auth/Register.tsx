import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, MapPin, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { authApi } from "../../api/auth";
import CornerBrackets from "../../components/CornerBrackets";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      await authApi.register({ name, email, password, city });

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Erro ao realizar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center relative overflow-hidden pb-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="tactical-panel w-full max-w-xl bg-brand-card p-8 md:p-10 border border-brand-border shadow-2xl relative z-10 backdrop-blur-xl">
        <CornerBrackets corners={["tr", "bl"]} size={18} />
        <div className="text-center space-y-4 mb-8">
          <div className="tactical-panel-sm w-16 h-16 bg-brand-bg border border-brand-primary/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(225,255,0,0.2)]">
            <UserPlus size={32} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Alistamento
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Registre-se para comprar, vender e participar de operações.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Codinome / Nome
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sgt. Ghost"
                  className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                E-mail
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
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              Cidade / Estado de Atuação
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Foz do Iguaçu, PR"
                className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Senha Segura
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tactical-panel-xs w-full h-14 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>CONCLUIR ALISTAMENTO <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
          Já tem acesso?{" "}
          <Link to="/login" className="text-brand-primary hover:text-white transition-colors ml-1">
            Entrar na Base
          </Link>
        </div>
      </div>
    </div>
  );
};


export default Register;
