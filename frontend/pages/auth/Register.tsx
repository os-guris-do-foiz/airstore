import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, MapPin, ArrowRight, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { authApi } from "../../api/auth";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [roleMode, setRoleMode] = useState<"USER" | "FIELD_OWNER">("USER");
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
      await authApi.register({ name, email, password, city } as any);
      
      // Cadastro bem sucedido, ir pro login
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

      <div className="w-full max-w-xl bg-brand-card p-8 md:p-10 rounded-[2rem] border border-brand-border shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-brand-bg border border-brand-primary/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(225,255,0,0.2)]">
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

        {/* Escolha do tipo de registro - Fundamental para converter Lojistas automaticamente pro cargo certo (sujeito a aprovação se precisar num DB real) */}
        <div className="flex bg-brand-bg p-1 rounded-xl mb-8 border border-brand-border">
          <button 
            onClick={() => setRoleMode("USER")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${roleMode === "USER" ? "bg-brand-card border border-brand-border text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
          >
            SOU JOGADOR
          </button>
          <button 
            onClick={() => setRoleMode("FIELD_OWNER")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${roleMode === "FIELD_OWNER" ? "bg-brand-card border border-brand-primary/50 text-brand-primary shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
          >
            SOU DONO DE CAMPO
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                {roleMode === "USER" ? "Codinome / Nome" : "Nome do Campo / Loja"}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={roleMode === "USER" ? "Sgt. Ghost" : "Base Alpha CQB"}
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-xl h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
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
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-xl h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
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
                className="w-full bg-brand-bg/50 border border-brand-border rounded-xl h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
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
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-xl h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
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
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-xl h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {roleMode === "FIELD_OWNER" && (
            <div className="bg-brand-primary/10 border border-brand-primary/30 p-4 rounded-xl flex items-start gap-3 mt-4">
              <HelpCircle className="text-brand-primary shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-brand-primary-light">
                Contas de Donos de Campo passam por uma breve revisão da equipe administrativa para liberação da exibição na aba "Campos". O recurso de compra e venda está liberado de imediato.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 mt-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
