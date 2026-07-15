import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { authApi } from "../../api/auth";
import CornerBrackets from "../../components/CornerBrackets";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      
      localStorage.setItem("fronteira_token", response.token || "fake-token");
      localStorage.setItem("fronteira_user", JSON.stringify(response.user));

      navigate("/");
    } catch (err: any) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        navigate("/verificar-email", { state: { email } });
        return;
      }
      setError(err.message || "Falha ao realizar login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="tactical-panel w-full max-w-md bg-brand-card p-8 md:p-10 border border-brand-border shadow-2xl relative z-10 backdrop-blur-xl">
        <CornerBrackets corners={["tr", "bl"]} size={18} />
        <div className="text-center space-y-4 mb-8">
          <div className="tactical-panel-sm w-16 h-16 bg-brand-bg border border-brand-primary/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(225,255,0,0.2)]">
            <ShieldCheck size={32} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Acesso Seguro
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Painel de Operações Fronteira 
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
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
                className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1 pr-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Senha Segura
              </label>
              <Link to="/recuperar-senha" className="text-[10px] uppercase font-bold text-brand-primary hover:text-white transition-colors">
                Recuperar
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="tactical-panel-xs w-full h-14 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>ENTRAR NA BASE <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
          Novo Recruta?{" "}
          <Link to="/register" className="text-brand-primary hover:text-white transition-colors ml-1">
            Requisite Acesso
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
