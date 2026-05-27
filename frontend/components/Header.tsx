import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, User, Menu, X, LogOut, LayoutDashboard, Crown, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("fronteira_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location.pathname]); // Update on route change

  const handleLogout = () => {
    localStorage.removeItem("fronteira_user");
    localStorage.removeItem("fronteira_token");
    setUser(null);
    navigate("/login");
  };

  const isAdmin = user?.roles?.includes("ADMIN");
  const isFieldOwner = user?.roles?.includes("FIELD_OWNER");

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-xl border-b border-brand-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-black text-xl">F</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter text-white uppercase">
                  FRONTEIRA
                  <span className="text-brand-primary-light"> AIRSOFT</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">
                  Brasil
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/ads"
                className="text-gray-400 hover:text-white transition-all font-black uppercase text-[11px] tracking-widest relative group"
              >
                Anúncios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
              </Link>
              <Link
                to="/ads?category=Serviços"
                className="text-gray-400 hover:text-white transition-all font-black uppercase text-[11px] tracking-widest relative group"
              >
                Serviços
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
              </Link>
              <Link
                to="/teams"
                className="text-gray-400 hover:text-white transition-all font-black uppercase text-[11px] tracking-widest relative group"
              >
                Times
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
              </Link>
              <Link
                to="/campos"
                className="text-gray-400 hover:text-white transition-all font-black uppercase text-[11px] tracking-widest relative group"
              >
                Campos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full" />
              </Link>
              {isFieldOwner && (
                <Link
                  to="/painel-campo"
                  className="text-brand-primary/80 hover:text-brand-primary transition-all font-black uppercase text-[11px] tracking-widest relative group border-l border-white/10 pl-6 ml-2 flex items-center gap-2"
                >
                  <Crown size={14} className="text-yellow-500" />
                  Painel Dono
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-red-500 hover:text-red-400 transition-all font-black uppercase text-[11px] tracking-widest relative group border-l border-white/10 pl-6 ml-2 flex items-center gap-2"
                >
                  <ShieldAlert size={14} />
                   Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/ads/new"
              className="bg-brand-primary hover:bg-brand-primary-light text-black px-6 py-3 rounded-xl transition-all duration-300 font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle size={18} />
              <span>Anunciar</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={`/profile/${user.id}`}
                  className="px-4 h-12 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center gap-3 text-gray-400 hover:text-white hover:border-brand-primary transition-all group"
                >
                  {user.avatar ? (
                    <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={18} className="group-hover:text-brand-primary transition-colors" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest mt-0.5 truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>

                {/* VISUALIZAÇÃO PEDIDA PELO USUÁRIO (SEM FUNCIONAMENTO) */}
                <div className="flex items-center gap-3 border-l border-brand-border pl-4 ml-2">
                  <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Demo Auth:</span>
                  <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                    Login
                  </button>
                  <button className="text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-lg hover:bg-brand-primary hover:text-black transition-all">
                    Cadastro
                  </button>
                  <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-primary transition-colors underline">
                    Esqueci a Senha
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white font-black uppercase text-[11px] tracking-widest"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="border border-brand-primary/30 text-brand-primary-light hover:bg-brand-primary hover:text-black px-4 py-2 rounded-xl transition-all font-black uppercase text-[11px] tracking-widest"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-card border-b border-brand-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link
                to="/ads"
                className="block px-3 py-2 text-gray-300 hover:text-white uppercase font-black text-xs tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                Anúncios
              </Link>
              <Link
                to="/teams"
                className="block px-3 py-2 text-gray-300 hover:text-white uppercase font-black text-xs tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                Times
              </Link>
              <Link
                to="/campos"
                className="block px-3 py-2 text-gray-300 hover:text-white uppercase font-black text-xs tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                Campos
              </Link>
              
              <div className="pt-4 mt-4 border-t border-gray-800 space-y-2">
                {user ? (
                  <>
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-brand-primary uppercase font-black text-xs tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={16} /> Meu Perfil
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-500 uppercase font-black text-xs tracking-widest"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-white uppercase font-black text-xs tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-brand-primary uppercase font-black text-xs tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      Cadastrar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
