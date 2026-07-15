import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  MapPin,
  Lock,
  Mail,
  BadgeCheck,
  Save,
  Loader2,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { authApi } from "../../api/auth";
import { usersApi } from "../../api/users";
import { toast } from "../../utils/toast";
import CornerBrackets from "../../components/CornerBrackets";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [me, setMe] = useState<any>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fronteira_user");
    if (!stored) {
      navigate("/login");
      return;
    }
    authApi
      .me()
      .then((fresh) => {
        setMe(fresh);
        setName(fresh.name || "");
        setNickname(fresh.nickname || "");
        setCity(fresh.city || "");
        setBio(fresh.bio || "");
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoadingMe(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setSavingProfile(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("nickname", nickname);
      form.append("city", city);
      form.append("bio", bio);
      const updated = await usersApi.updateProfile(me.id, form);

      const stored = JSON.parse(localStorage.getItem("fronteira_user") || "{}");
      localStorage.setItem(
        "fronteira_user",
        JSON.stringify({ ...stored, name: updated.name, nickname: updated.nickname, city: updated.city })
      );

      toast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar o perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      toast.success(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar a senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogoutAll = () => {
    localStorage.removeItem("fronteira_user");
    localStorage.removeItem("fronteira_token");
    navigate("/login");
  };

  const inputClass =
    "tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border h-12 pl-12 pr-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all";
  const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1";

  if (loadingMe) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="tactical-panel-sm w-14 h-14 bg-brand-card border border-brand-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(225,255,0,0.15)]">
            <SettingsIcon size={26} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Configurações
            </h1>
            <p className="text-gray-400 text-sm">Gerencie os dados e a segurança da sua conta.</p>
          </div>
        </div>

        <section className="tactical-panel relative bg-brand-card border border-brand-border p-8 space-y-4">
          <CornerBrackets corners={["tr", "bl"]} size={16} />
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Mail size={16} className="text-brand-primary" /> E-mail da Conta
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tactical-panel-xs text-gray-300 text-sm font-mono bg-brand-bg/50 border border-brand-border px-4 py-3">
              {me?.email}
            </span>
            {me?.email_verified ? (
              <span className="flex items-center gap-1.5 text-brand-primary text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 border border-brand-primary/30 rounded-full px-3 py-1.5">
                <BadgeCheck size={14} /> Verificado
              </span>
            ) : (
              <button
                onClick={() => navigate("/verificar-email", { state: { email: me?.email } })}
                className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-widest bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1.5 hover:bg-amber-400/20 transition-colors"
              >
                Não verificado — verificar agora
              </button>
            )}
          </div>
        </section>

        <section className="tactical-panel relative bg-brand-card border border-brand-border p-8">
          <CornerBrackets corners={["tr", "bl"]} size={16} />
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
            <User size={16} className="text-brand-primary" /> Dados do Perfil
          </h2>

          <form className="space-y-5" onSubmit={handleSaveProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className={labelClass}>Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Codinome / Apelido</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Sgt. Ghost" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Cidade / Estado</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Foz do Iguaçu, PR" className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Conte um pouco sobre você ou seu histórico em campo..."
                className="tactical-panel-xs w-full bg-brand-bg/50 border border-brand-border p-4 text-white placeholder-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="tactical-panel-xs h-12 px-8 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Salvar Alterações
            </button>
          </form>
        </section>

        <section className="tactical-panel relative bg-brand-card border border-brand-border p-8">
          <CornerBrackets corners={["tr", "bl"]} size={16} />
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
            <Lock size={16} className="text-brand-primary" /> Alterar Senha
          </h2>

          <form className="space-y-5" onSubmit={handleChangePassword}>
            <div className="space-y-2">
              <label className={labelClass}>Senha Atual</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className={labelClass}>Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Confirmar Nova Senha</label>
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
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="tactical-panel-xs h-12 px-8 bg-brand-primary hover:bg-brand-primary-light text-black text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {savingPassword ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Alterar Senha
            </button>
          </form>
        </section>

        <section className="tactical-panel relative bg-brand-card border border-red-500/20 p-8 flex flex-wrap items-center justify-between gap-4">
          <CornerBrackets corners={["tr", "bl"]} color="#ef4444" size={16} />
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Sessão</h2>
            <p className="text-gray-500 text-xs mt-1">Encerra a sessão neste dispositivo.</p>
          </div>
          <button
            onClick={handleLogoutAll}
            className="tactical-panel-xs h-12 px-6 border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
