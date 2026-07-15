import React, { useState, useEffect } from "react";
import {
  ShieldAlert, ShieldCheck, UserCog, Search,
  Check, BadgeCheck, Store, User, X,
  AlertTriangle, Flag, ExternalLink, CheckCircle2, Ban,
  Loader2, MapPinned, Trash2, Settings, Plus, Minus, Eye, Users as UsersIcon,
  Heart, Crown,
} from "lucide-react";
import { reportsApi, Report } from "../../api/reports";
import { usersApi, AppUser, UserRole, UserStatus, UserFilter } from "../../api/users";
import { fieldsApi, Field } from "../../api/fields";
import { donationsApi, REAIS_PER_WEEK } from "../../api/donations";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import CornerBrackets from "../../components/CornerBrackets";

const RoleBadges = ({ roles = [] }: { roles: UserRole[] }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map(r => {
        switch (r) {
          case "ADMIN": return <span key={r} className="flex items-center gap-1 bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-black tracking-widest"><ShieldAlert size={10}/> MASTER</span>;
          case "FIELD_OWNER": return <span key={r} className="flex items-center gap-1 bg-brand-primary/20 text-brand-primary px-2 py-1 rounded text-[10px] font-black tracking-widest"><Store size={10}/> PARCEIRO</span>;
          case "PREMIUM": return <span key={r} className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-black tracking-widest"><BadgeCheck size={10}/> DOADOR</span>;
          case "USER": return <span key={r} className="flex items-center gap-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-[10px] font-black tracking-widest"><User size={10}/> OPERADOR</span>;
          default: return null;
        }
      })}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "fields" | "reports">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserFilter | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userStats, setUserStats] = useState({ total: 0, fieldOwners: 0, premium: 0, admins: 0, banned: 0, active: 0 });

  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editLimit, setEditLimit] = useState(0);

  const [donationUser, setDonationUser] = useState<AppUser | null>(null);
  const [donationAmount, setDonationAmount] = useState("10");
  const [savingDonation, setSavingDonation] = useState(false);

  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldOwnerFilter, setFieldOwnerFilter] = useState<"owned" | "unowned" | null>(null);
  const [fieldPage, setFieldPage] = useState(1);
  const [fieldTotalPages, setFieldTotalPages] = useState(1);
  const [fieldStats, setFieldStats] = useState({ total: 0, unowned: 0 });

  const [reportStatusFilter, setReportStatusFilter] = useState<"PENDING" | "RESOLVED" | "DISMISSED" | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState<"AD" | "FIELD" | "USER" | "SYSTEM" | null>(null);
  const [reportPage, setReportPage] = useState(1);
  const [reportTotalPages, setReportTotalPages] = useState(1);
  const [reportStats, setReportStats] = useState({ total: 0, pending: 0, resolved: 0, dismissed: 0 });

  useEffect(() => {
    setUserPage(1);
  }, [search, roleFilter]);
  useEffect(() => {
    setFieldPage(1);
  }, [fieldSearch, fieldOwnerFilter]);
  useEffect(() => {
    setReportPage(1);
  }, [reportStatusFilter, reportTypeFilter]);

  useEffect(() => {
    if (activeTab !== "users") return;
    const t = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(t);
  }, [activeTab, search, roleFilter, userPage]);

  useEffect(() => {
    if (activeTab !== "fields") return;
    const t = setTimeout(() => fetchFields(), 300);
    return () => clearTimeout(t);
  }, [activeTab, fieldSearch, fieldOwnerFilter, fieldPage]);

  useEffect(() => {
    if (activeTab !== "reports") return;
    fetchReports();
  }, [activeTab, reportStatusFilter, reportTypeFilter, reportPage]);

  useEffect(() => {
    usersApi.getStats().then(setUserStats).catch(() => {});
  }, [users]);

  useEffect(() => {
    if (activeTab === "fields") fieldsApi.getStats().then(setFieldStats).catch(() => {});
  }, [activeTab, fields]);

  const fetchFields = async () => {
    setLoadingFields(true);
    try {
      const data = await fieldsApi.getAll({
        search: fieldSearch.trim() || undefined,
        ownerFilter: fieldOwnerFilter || undefined,
        page: fieldPage,
      });
      setFields(data.items);
      setFieldTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao buscar campos:", err);
    } finally {
      setLoadingFields(false);
    }
  };

  const deleteField = async (id: string, name: string) => {
    if (!(await confirmDialog({ title: "Excluir campo", message: `Excluir o campo "${name}"? Todas as partidas serão removidas.`, confirmText: "Excluir", danger: true }))) return;
    try {
      await fieldsApi.delete(id);
      setFields((prev) => prev.filter((f) => f.id !== id));
      toast.success(`Campo "${name}" excluído.`);
    } catch (err: any) {
      toast.error(err.message || "Falha ao excluir o campo.");
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await usersApi.getAll({ search: search.trim() || undefined, page: userPage, filter: roleFilter || undefined });
      setUsers(data.items);
      setUserTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await reportsApi.getAll({
        status: reportStatusFilter || undefined,
        type: reportTypeFilter || undefined,
        page: reportPage,
      });
      setReports(data.items);
      setReportTotalPages(data.totalPages);
      reportsApi.getStats().then(setReportStats).catch(() => {});
    } catch (err) {
      console.error("Erro ao buscar reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUpdateReportStatus = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await reportsApi.updateStatus(id, status);
      await fetchReports();
      toast.success("Denúncia resolvida.");
    } catch (err: any) {
      toast.error(err.message || "Falha ao atualizar a denúncia.");
    }
  };

  const toggleRoleForEditingUser = (role: UserRole) => {
    if (!editingUser) return;
    const currentRoles = editingUser.roles || [];
    const adding = !currentRoles.includes(role);
    const newRoles = adding
      ? [...currentRoles, role]
      : currentRoles.filter(r => r !== role);

    if (newRoles.length === 0) newRoles.push("USER");

    if (role === "FIELD_OWNER" && adding && editLimit <= 0) {
      setEditLimit(1);
    }

    const updatedUser = { ...editingUser, roles: newRoles as UserRole[] };
    setEditingUser(updatedUser);
  };

  const openEditor = (user: AppUser) => {
    setEditingUser({ ...user });
    setEditLimit(user.field_limit ?? 0);
  };

  const saveRoles = async () => {
    if (!editingUser) return;
    const isOwner = (editingUser.roles || []).includes("FIELD_OWNER");
    const limit = isOwner ? editLimit : 0;
    try {
      await usersApi.updateRoles(editingUser.id, editingUser.roles, limit);
      const updated = { ...editingUser, field_limit: limit };
      setUsers(users.map(u => u.id === editingUser.id ? updated : u));
      setEditingUser(null);
      toast.success("Cargos atualizados.");
    } catch (err: any) {
      toast.error(err.message || "Falha ao salvar cargos.");
    }
  };

  const openDonationModal = (user: AppUser) => {
    setDonationUser(user);
    setDonationAmount(String(REAIS_PER_WEEK));
  };

  const saveDonation = async () => {
    if (!donationUser) return;
    const amount = Number(donationAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setSavingDonation(true);
    try {
      await donationsApi.registerManual({ userId: donationUser.id, amount });
      const weeks = Math.floor(amount / REAIS_PER_WEEK);
      toast.success(
        weeks > 0
          ? `Doação registrada! ${donationUser.name} ganhou ${weeks} semana(s) de destaque.`
          : `Doação registrada, mas menos de R$${REAIS_PER_WEEK} não gera tempo de destaque.`
      );
      setDonationUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Falha ao registrar a doação.");
    } finally {
      setSavingDonation(false);
    }
  };

  const toggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await usersApi.updateStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(newStatus === 'BANNED' ? "Usuário banido." : "Usuário reabilitado.");
    } catch (err: any) {
      toast.error(err.message || "Falha ao alterar status.");
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-24">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <UserCog className="text-red-500" size={40} />
            Controle Central
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Painel exclusivo da Administração.</p>
        </div>

        <div className="flex bg-brand-card border border-brand-border p-1.5 tactical-panel-sm">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "users" ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white"
            }`}
          >
            <UsersIcon size={14} /> Usuários
          </button>
          <button
            onClick={() => setActiveTab("fields")}
            className={`px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "fields" ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white"
            }`}
          >
            <MapPinned size={14} /> Campos
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "reports" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-gray-500 hover:text-white"
            }`}
          >
            <Flag size={14} /> Denúncias
            {reportStats.pending > 0 && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {([
              { key: null, label: "Total Usuários", value: userStats.total, color: "text-white" },
              { key: "ACTIVE" as UserFilter, label: "Ativos", value: userStats.active, color: "text-brand-green" },
              { key: "FIELD_OWNER" as UserFilter, label: "Parceiros", value: userStats.fieldOwners, color: "text-brand-primary" },
              { key: "PREMIUM" as UserFilter, label: "Doadores", value: userStats.premium, color: "text-yellow-500" },
              { key: "ADMIN" as UserFilter, label: "Admins", value: userStats.admins, color: "text-purple-400" },
              { key: "BANNED" as UserFilter, label: "Banidos", value: userStats.banned, color: "text-red-500" },
            ]).map((card) => {
              const isActive = roleFilter === card.key;
              return (
                <button
                  key={card.label}
                  onClick={() => setRoleFilter(card.key)}
                  className={`text-left bg-brand-card border tactical-panel-sm p-4 transition-all ${
                    isActive ? "border-brand-primary ring-1 ring-brand-primary shadow-lg shadow-brand-primary/10" : "border-brand-border hover:border-gray-600"
                  }`}
                >
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                </button>
              );
            })}
          </div>

          {roleFilter && (
            <div className="flex items-center gap-2 mb-4 -mt-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Filtro ativo</span>
              <button
                onClick={() => setRoleFilter(null)}
                className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/20 transition-colors"
              >
                <X size={10} /> Limpar
              </button>
            </div>
          )}

          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-card border border-brand-border tactical-panel-xs pl-12 pr-4 py-3 text-white focus:border-brand-primary outline-none"
            />
          </div>

          <div className="bg-brand-card border border-brand-border tactical-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="p-6 font-bold">Usuário</th>
                    <th className="p-6 font-bold">Cargos</th>
                    <th className="p-6 font-bold">Status</th>
                    <th className="p-6 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-black">
                            {(user.name || "?").charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight">{user.name || "Sem Nome"}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <RoleBadges roles={user.roles || []} />
                        {(user.roles || []).includes("FIELD_OWNER") && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <Store size={9} /> Limite: {user.field_limit ?? 0} campo(s)
                          </span>
                        )}
                        {user.is_donor && user.donor_expiry && (
                          <span className="flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-yellow-500">
                            <Crown size={9} fill="currentColor" /> Até {new Date(user.donor_expiry).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </td>
                      <td className="p-6">
                        {user.status === 'ACTIVE' ? (
                          <span className="text-brand-green text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Check size={12}/> Ativo</span>
                        ) : (
                          <span className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><X size={12}/> Banido</span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                              onClick={() => openEditor(user)}
                              disabled={user.email === 'admin@fronteira.com'}
                              className="bg-brand-bg border border-brand-border hover:border-brand-primary text-gray-300 hover:text-brand-primary px-3 py-1.5 tactical-panel-xs text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-30"
                            >
                              Cargos
                            </button>
                            <button
                              onClick={() => openDonationModal(user)}
                              className="bg-brand-bg border border-brand-border hover:border-yellow-500 hover:text-yellow-500 text-gray-300 px-3 py-1.5 tactical-panel-xs text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                              <Heart size={11} /> Doação
                            </button>
                            <button
                              onClick={() => toggleStatus(user.id)}
                              disabled={user.email === 'admin@fronteira.com'}
                              className="bg-brand-bg border border-brand-border hover:border-red-500 hover:text-red-500 px-3 py-1.5 tactical-panel-xs text-[10px] font-bold uppercase tracking-widest text-gray-300 transition-colors disabled:opacity-30"
                            >
                              {user.status === 'ACTIVE' ? 'Banir' : 'Reabilitar'}
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={userPage} totalPages={userTotalPages} onChange={setUserPage} />
        </>
      ) : activeTab === "fields" ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="grid grid-cols-2 gap-4 flex-1 max-w-md w-full">
              <button
                onClick={() => setFieldOwnerFilter(null)}
                className={`text-left bg-brand-card border tactical-panel-sm p-4 transition-all ${fieldOwnerFilter === null ? "border-brand-primary ring-1 ring-brand-primary" : "border-brand-border hover:border-gray-600"}`}
              >
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Campos</p>
                <p className="text-2xl font-black text-white">{fieldStats.total}</p>
              </button>
              <button
                onClick={() => setFieldOwnerFilter(fieldOwnerFilter === "unowned" ? null : "unowned")}
                className={`text-left bg-brand-card border tactical-panel-sm p-4 transition-all ${fieldOwnerFilter === "unowned" ? "border-brand-primary ring-1 ring-brand-primary" : "border-brand-border hover:border-gray-600"}`}
              >
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Sem Dono</p>
                <p className="text-2xl font-black text-yellow-500">{fieldStats.unowned}</p>
              </button>
            </div>
            <button
              onClick={() => navigate("/campos/novo")}
              className="bg-brand-primary text-black hover:bg-brand-primary-light px-5 py-3 tactical-panel-xs text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors shrink-0"
            >
              <Plus size={16} /> Novo Campo
            </button>
          </div>

          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou localização..."
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              className="w-full bg-brand-card border border-brand-border tactical-panel-xs pl-12 pr-4 py-3 text-white focus:border-brand-primary outline-none"
            />
          </div>

          <div className="bg-brand-card border border-brand-border tactical-panel overflow-hidden">
            {loadingFields ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando...</p>
              </div>
            ) : fields.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <MapPinned className="mx-auto text-brand-border" size={60} />
                <h3 className="text-xl font-black text-white uppercase">
                  {fieldStats.total === 0 ? "Nenhum campo cadastrado" : "Nenhum campo encontrado"}
                </h3>
                <p className="text-gray-500">
                  {fieldStats.total === 0 ? 'Clique em "Novo Campo" para começar.' : "Tente outro filtro ou busca."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-500">
                      <th className="p-6 font-bold">Campo</th>
                      <th className="p-6 font-bold">Donos</th>
                      <th className="p-6 font-bold">Preço</th>
                      <th className="p-6 font-bold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {fields.map(field => (
                      <tr key={field.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight">{field.name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{field.location}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          {field.owner_names.length === 0 ? (
                            <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Sem dono</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {field.owner_names.map((n, i) => (
                                <span key={i} className="flex items-center gap-1 bg-brand-primary/15 text-brand-primary px-2 py-1 rounded text-[10px] font-black tracking-widest"><Store size={10} /> {n}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-6">
                          <span className="text-brand-green font-black">R$ {field.base_price}</span>
                          <span className="text-gray-500 text-[10px]"> +{field.rental_price} loc.</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/campos/${field.id}`} className="p-2 bg-brand-bg border border-brand-border hover:border-brand-primary text-gray-300 hover:text-brand-primary tactical-panel-xs transition-colors" title="Ver"><Eye size={16} /></Link>
                            <Link to={`/painel-campo/config/${field.id}`} className="p-2 bg-brand-bg border border-brand-border hover:border-brand-primary text-gray-300 hover:text-brand-primary tactical-panel-xs transition-colors" title="Editar / Donos"><Settings size={16} /></Link>
                            <button onClick={() => deleteField(field.id, field.name)} className="p-2 bg-brand-bg border border-brand-border hover:border-red-500 hover:text-red-500 text-gray-300 tactical-panel-xs transition-colors" title="Excluir"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <Pagination page={fieldPage} totalPages={fieldTotalPages} onChange={setFieldPage} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {([
              { key: null, label: "Total", value: reportStats.total, color: "text-white" },
              { key: "PENDING" as const, label: "Pendentes", value: reportStats.pending, color: "text-red-500" },
              { key: "RESOLVED" as const, label: "Resolvidos", value: reportStats.resolved, color: "text-brand-green" },
              { key: "DISMISSED" as const, label: "Ignorados", value: reportStats.dismissed, color: "text-gray-400" },
            ]).map((card) => {
              const active = reportStatusFilter === card.key;
              return (
                <button
                  key={card.label}
                  onClick={() => setReportStatusFilter(card.key)}
                  className={`text-left bg-brand-card border tactical-panel-sm p-4 transition-all ${active ? "border-brand-primary ring-1 ring-brand-primary" : "border-brand-border hover:border-gray-600"}`}
                >
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
                  <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {([
              { key: null, label: "Todos os Tipos" },
              { key: "AD" as const, label: "Anúncio" },
              { key: "FIELD" as const, label: "Campo" },
              { key: "USER" as const, label: "Usuário" },
              { key: "SYSTEM" as const, label: "Sistema" },
            ]).map((t) => {
              const active = reportTypeFilter === t.key;
              return (
                <button
                  key={t.label}
                  onClick={() => setReportTypeFilter(t.key)}
                  className={`tactical-panel-xs px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                    active ? "bg-brand-primary text-black border-brand-primary" : "bg-brand-card border-brand-border text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="bg-brand-card border border-brand-border tactical-panel overflow-hidden">
            {loadingReports ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <ShieldCheck className="mx-auto text-brand-green/30" size={60} />
                <h3 className="text-xl font-black text-white uppercase">
                  {reportStats.total === 0 ? "Tudo Limpo" : "Nenhuma denúncia encontrada"}
                </h3>
                <p className="text-gray-500">
                  {reportStats.total === 0 ? "Sem denúncias no momento." : "Tente outro filtro."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-500">
                      <th className="p-6 font-bold">Alvo</th>
                      <th className="p-6 font-bold">Motivo</th>
                      <th className="p-6 font-bold">Descrição</th>
                      <th className="p-6 font-bold">Autor</th>
                      <th className="p-6 font-bold">Status</th>
                      <th className="p-6 font-bold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {reports.map(report => (
                      <tr key={report.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full w-fit uppercase ${
                              report.type === 'AD' ? 'bg-brand-primary/20 text-brand-primary' : 
                              report.type === 'FIELD' ? 'bg-yellow-500/20 text-yellow-500' : 
                              report.type === 'SYSTEM' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-purple-500/20 text-purple-500'
                            }`}>
                              {report.type === 'SYSTEM' ? 'SISTEMA' : report.type}
                            </span>
                            {report.type !== 'SYSTEM' ? (
                              <Link 
                                to={report.type === 'AD' ? `/ads/${report.target_id}` : report.type === 'FIELD' ? `/campos/${report.target_id}` : `/profile/${report.target_id}`} 
                                className="text-white font-bold hover:text-brand-primary transition-all flex items-center gap-1 group"
                              >
                                Ver <ExternalLink size={12} className="opacity-50 group-hover:opacity-100" />
                              </Link>
                            ) : (
                               <span className="text-gray-500 text-[10px] font-bold">PLATAFORMA</span>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-white font-black uppercase text-xs tracking-tight flex items-center gap-2">
                             <AlertTriangle size={14} className="text-red-500" />
                             {report.reason}
                          </span>
                        </td>
                        <td className="p-6">
                           <p className="text-xs text-gray-500 max-w-[200px] line-clamp-2">
                              {report.description || "-"}
                           </p>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col">
                              <span className="text-white font-bold text-sm tracking-tight">{report.reporter.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{report.reporter.email}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           {report.status === 'PENDING' ? (
                              <span className="bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                                 <Flag size={10} /> Pendente
                              </span>
                           ) : report.status === 'RESOLVED' ? (
                              <span className="bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                                 <CheckCircle2 size={10} /> Resolvido
                              </span>
                           ) : (
                              <span className="bg-gray-500/10 text-gray-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                                 <Ban size={10} /> Ignorado
                              </span>
                           )}
                        </td>
                        <td className="p-6 text-right">
                           {report.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                 <button
                                    onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                                    className="px-3 py-2 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-black tactical-panel-xs transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                 >
                                    <CheckCircle2 size={16} /> Resolver
                                 </button>
                              </div>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <Pagination page={reportPage} totalPages={reportTotalPages} onChange={setReportPage} />
        </>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="bg-brand-card w-full max-w-lg tactical-panel border border-brand-border p-8 relative z-10">
          <CornerBrackets corners={["tr", "bl"]} size={16} />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Modificar Credenciais</h3>
            <p className="text-gray-400 text-sm mb-6 font-bold">Editando: <span className="text-brand-primary">{editingUser.name}</span></p>
            
            <div className="space-y-3">
              {[
                { role: "USER", title: "Operador", icon: <User className="text-gray-400" /> },
                { role: "PREMIUM", title: "Doador", icon: <BadgeCheck className="text-yellow-500" /> },
                { role: "FIELD_OWNER", title: "Dono de Campo", icon: <Store className="text-brand-primary" /> },
                { role: "ADMIN", title: "Administrador", icon: <ShieldAlert className="text-red-500" /> }
              ].map(r => {
                const hasRole = (editingUser.roles || []).includes(r.role as UserRole);
                return (
                  <button
                    key={r.role}
                    onClick={() => toggleRoleForEditingUser(r.role as UserRole)}
                    className={`w-full text-left flex items-center gap-4 p-4 tactical-panel-xs border transition-all ${
                      hasRole ? "bg-brand-primary/10 border-brand-primary" : "bg-brand-bg border-brand-border hover:border-gray-600"
                    }`}
                  >
                    {r.icon}
                    <span className={`font-black uppercase tracking-widest text-sm ${hasRole ? 'text-white' : 'text-gray-400'}`}>{r.title}</span>
                    {hasRole && <Check className="ml-auto text-brand-primary" size={16} />}
                  </button>
                );
              })}
            </div>

            {(editingUser.roles || []).includes("FIELD_OWNER") && (
              <div className="mt-4 bg-brand-bg border border-brand-primary/30 tactical-panel-xs p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Store size={14} className="text-brand-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Limite de Campos Próprios</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">Quantos campos este dono pode criar sozinho. 0 = não pode criar.</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditLimit((v) => Math.max(0, v - 1))}
                    className="w-10 h-10 tactical-panel-xs bg-brand-card border border-brand-border text-white hover:border-brand-primary flex items-center justify-center transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number" min={0} value={editLimit}
                    onChange={(e) => setEditLimit(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    className="w-20 text-center bg-brand-card border border-brand-border tactical-panel-xs p-2.5 text-white text-lg font-black focus:border-brand-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditLimit((v) => v + 1)}
                    className="w-10 h-10 tactical-panel-xs bg-brand-card border border-brand-border text-white hover:border-brand-primary flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">campo(s)</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setEditingUser(null)} className="py-4 tactical-panel-xs border border-brand-border text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                Cancelar
              </button>
              <button onClick={saveRoles} className="py-4 tactical-panel-xs bg-brand-primary text-black hover:bg-brand-primary-light text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                <Check size={16}/> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {donationUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDonationUser(null)} />
          <div className="bg-brand-card w-full max-w-md tactical-panel border border-yellow-500/30 p-8 relative z-10">
          <CornerBrackets corners={["tr", "bl"]} color="#eab308" size={16} />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
              <Heart size={22} className="text-yellow-500" /> Registrar Doação
            </h3>
            <p className="text-gray-400 text-sm mb-6 font-bold">
              Para: <span className="text-yellow-500">{donationUser.name}</span>
            </p>

            <div className="bg-brand-bg/50 border border-brand-border tactical-panel-xs p-4 mb-6 text-xs text-gray-400 leading-relaxed">
              Use isto depois de conferir o PIX recebido manualmente. A cada <strong className="text-yellow-500">R$ {REAIS_PER_WEEK}</strong> o usuário ganha <strong className="text-yellow-500">1 semana</strong> de destaque de doador — o tempo soma em cima do prazo atual, se já for doador.
            </div>

            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Valor doado (R$)</label>
            <input
              type="number" min={1} step="0.01" value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full mt-2 bg-brand-bg border border-brand-border tactical-panel-xs p-3.5 text-white text-lg font-black focus:border-yellow-500 outline-none"
            />
            {Number(donationAmount) > 0 && (
              <p className="text-[11px] text-gray-500 mt-2">
                = {Math.floor(Number(donationAmount) / REAIS_PER_WEEK)} semana(s) de destaque.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setDonationUser(null)} className="py-4 tactical-panel-xs border border-brand-border text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                Cancelar
              </button>
              <button
                onClick={saveDonation}
                disabled={savingDonation}
                className="py-4 tactical-panel-xs bg-yellow-500 text-black hover:bg-yellow-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {savingDonation ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;