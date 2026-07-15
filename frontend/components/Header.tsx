import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, User, Menu, X, LogOut, Crown, ShieldAlert, Settings, Heart } from "lucide-react";
import { favoritesStore } from "../utils/favorites";
import { motion, AnimatePresence } from "motion/react";
import NotificationBell from "./NotificationBell";
import { refreshCurrentUser } from "../utils/auth";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("fronteira_user");
    setUser(userData ? JSON.parse(userData) : null);
  }, [location.pathname]);

  useEffect(() => {
    refreshCurrentUser().then(({ user: fresh, sessionInvalid }) => {
      if (sessionInvalid) {
        setUser(null);
        navigate("/login");
        return;
      }
      if (fresh) setUser(fresh);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fronteira_user");
    localStorage.removeItem("fronteira_token");
    favoritesStore.reset(); // não vazar favoritos de quem saiu pro próximo login
    setUser(null);
    navigate("/login");
  };

  const isAdmin = user?.roles?.includes("ADMIN");
  const isFieldOwner = user?.roles?.includes("FIELD_OWNER");

  const navLinks = [
    { to: "/ads", label: "Anúncios" },
    { to: "/ads?category=Serviços", label: "Serviços" },
    { to: "/usuarios", label: "Operadores" },
    { to: "/teams", label: "Times" },
    { to: "/campos", label: "Campos" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/70 backdrop-blur-xl border-b border-brand-border shadow-[0_4px_30px_-10px_rgba(168,85,247,0.25)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="tactical-panel-xs relative w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)", boxShadow: "0 0 22px -4px rgba(168,85,247,0.6)" }}>
                <span className="text-white font-black text-xl font-display">F</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter text-white uppercase font-display">
                  FRONTEIRA<span className="text-brand-primary text-glow-lime"> AIRSOFT</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-purple-light/70">
                  Marketplace Tático
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-gray-400 hover:text-white transition-all font-black uppercase text-[11px] tracking-widest relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all group-hover:w-full shadow-[0_0_8px_rgba(198,255,46,0.6)]" />
                </Link>
              ))}
              {isFieldOwner && (
                <Link
                  to="/painel-campo"
                  className="text-brand-purple-light hover:text-white transition-all font-black uppercase text-[11px] tracking-widest border-l border-white/10 pl-6 ml-2 flex items-center gap-2"
                >
                  <Crown size={14} className="text-brand-primary" />
                  Painel Dono
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-red-400 hover:text-red-300 transition-all font-black uppercase text-[11px] tracking-widest border-l border-white/10 pl-6 ml-2 flex items-center gap-2"
                >
                  <ShieldAlert size={14} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/ads/new"
              className="btn-primary px-5 py-3 text-xs tracking-widest uppercase gap-2"
            >
              <PlusCircle size={18} />
              <span>Anunciar</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link
                  to={`/profile/${user.id}`}
                  className="tactical-panel-xs px-4 h-12 bg-brand-card border border-brand-border flex items-center justify-center gap-3 text-gray-300 hover:text-white hover:border-brand-purple transition-all group"
                >
                  {user.avatar ? (
                    <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={18} className="group-hover:text-brand-purple-light transition-colors" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest mt-0.5 truncate max-w-[80px]">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>
                <Link
                  to="/favoritos"
                  className="tactical-panel-xs w-12 h-12 bg-brand-card border border-brand-border flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all"
                  title="Meus Favoritos"
                >
                  <Heart size={18} />
                </Link>
                <Link
                  to="/configuracoes"
                  className="tactical-panel-xs w-12 h-12 bg-brand-card border border-brand-border flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all"
                  title="Configurações"
                >
                  <Settings size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="tactical-panel-xs w-12 h-12 bg-brand-card border border-brand-border flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white font-black uppercase text-[11px] tracking-widest transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="tactical-panel-xs border border-brand-purple/40 text-brand-purple-light hover:bg-brand-purple hover:text-white px-4 py-2 transition-all font-black uppercase text-[11px] tracking-widest"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
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
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="block px-3 py-2.5 text-gray-300 hover:text-brand-primary uppercase font-black text-xs tracking-widest transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {l.label}
                </Link>
              ))}

              <Link
                to="/ads/new"
                className="btn-primary w-full h-11 mt-2 text-xs tracking-widest uppercase gap-2"
                onClick={() => setIsOpen(false)}
              >
                <PlusCircle size={16} /> Anunciar
              </Link>

              <div className="pt-4 mt-4 border-t border-brand-border space-y-1">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-red-400 uppercase font-black text-xs tracking-widest" onClick={() => setIsOpen(false)}>
                    <ShieldAlert size={16} /> Admin
                  </Link>
                )}
                {isFieldOwner && (
                  <Link to="/painel-campo" className="flex items-center gap-3 px-3 py-2.5 text-brand-purple-light uppercase font-black text-xs tracking-widest" onClick={() => setIsOpen(false)}>
                    <Crown size={16} /> Painel Dono
                  </Link>
                )}
                {user ? (
                  <>
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 text-brand-primary uppercase font-black text-xs tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={16} /> Meu Perfil
                    </Link>
                    <Link
                      to="/favoritos"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-300 uppercase font-black text-xs tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      <Heart size={16} /> Meus Favoritos
                    </Link>
                    <Link
                      to="/configuracoes"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-300 uppercase font-black text-xs tracking-widest"
                      onClick={() => setIsOpen(false)}
                    >
                      <Settings size={16} /> Configurações
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-red-400 uppercase font-black text-xs tracking-widest"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2.5 text-white uppercase font-black text-xs tracking-widest" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="block px-3 py-2.5 text-brand-purple-light uppercase font-black text-xs tracking-widest" onClick={() => setIsOpen(false)}>
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
