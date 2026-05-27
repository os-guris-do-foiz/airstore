import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, UserCog, Search, Filter, 
  MoreVertical, Check, BadgeCheck, Store, User, X,
  AlertTriangle, Flag, ExternalLink, CheckCircle2, Ban,
  Loader2
} from "lucide-react";
import { reportsApi, Report } from "../../api/reports";
import { usersApi, AppUser, UserRole, UserStatus } from "../../api/users";
import { Link } from "react-router-dom";

// 🛡️ TRAVA 1: Se 'roles' vier vazio, assume uma lista vazia []
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
  const [activeTab, setActiveTab] = useState<"users" | "reports">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await reportsApi.getAll();
      setReports(data);
    } catch (err) {
      console.error("Erro ao buscar reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUpdateReportStatus = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await reportsApi.updateStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error("Erro ao atualizar report:", err);
    }
  };

  // 🛡️ TRAVA 2: Evita crash se o usuário não tiver nome ou email
  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleRoleForEditingUser = (role: UserRole) => {
    if (!editingUser) return;
    // 🛡️ TRAVA 3: Garante que os cargos existam antes de usar .includes
    const currentRoles = editingUser.roles || [];
    const newRoles = currentRoles.includes(role) 
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    if (newRoles.length === 0) newRoles.push("USER");

    const updatedUser = { ...editingUser, roles: newRoles as UserRole[] };
    setEditingUser(updatedUser);
  };

  const saveRoles = async () => {
    if (!editingUser) return;
    try {
      await usersApi.updateRoles(editingUser.id, editingUser.roles);
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    } catch (err) {
      console.error("Erro ao salvar cargos:", err);
    }
  };

  const toggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await usersApi.updateStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error("Erro ao alternar status do usuário:", err);
    }
  };

  return (
    <div className="min-h-screen font-sans pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-24">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <UserCog className="text-red-500" size={40} />
            Controle Central
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Painel exclusivo da Administração.</p>
        </div>

        <div className="flex bg-brand-card border border-brand-border p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "users" ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white"
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "reports" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-gray-500 hover:text-white"
            }`}
          >
            Denúncias
            {reports.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Usuários</p>
              <p className="text-2xl font-black text-white">{users.length}</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Parceiros</p>
              {/* 🛡️ TRAVA 4: .includes protegido */}
              <p className="text-2xl font-black text-brand-primary">{users.filter(u => (u.roles || []).includes('FIELD_OWNER')).length}</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Doadores</p>
              <p className="text-2xl font-black text-yellow-500">{users.filter(u => (u.roles || []).includes('PREMIUM')).length}</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest mb-1">Banidos</p>
              <p className="text-2xl font-black text-red-500">{users.filter(u => u.status === 'BANNED').length}</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-primary outline-none"
            />
          </div>

          <div className="bg-brand-card border border-brand-border rounded-[2rem] overflow-hidden">
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
                  {filteredUsers.map(user => (
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
                              onClick={() => setEditingUser({...user})}
                              disabled={user.email === 'admin@fronteira.com'}
                              className="bg-brand-bg border border-brand-border hover:border-brand-primary text-gray-300 hover:text-brand-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-30"
                            >
                              Cargos
                            </button>
                            <button 
                              onClick={() => toggleStatus(user.id)}
                              disabled={user.email === 'admin@fronteira.com'}
                              className="bg-brand-bg border border-brand-border hover:border-red-500 hover:text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-300 transition-colors disabled:opacity-30"
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
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pendentes</p>
              <p className="text-2xl font-black text-red-500">{reports.filter(r => r.status === 'PENDING').length}</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Resolvidos</p>
              <p className="text-2xl font-black text-brand-green">{reports.filter(r => r.status === 'RESOLVED').length}</p>
            </div>
            <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-black text-white">{reports.length}</p>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-[2rem] overflow-hidden">
            {loadingReports ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Carregando...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <ShieldCheck className="mx-auto text-brand-green/30" size={60} />
                <h3 className="text-xl font-black text-white uppercase">Tudo Limpo</h3>
                <p className="text-gray-500">Sem denúncias no momento.</p>
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
                                    className="p-2 bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white rounded-lg transition-all"
                                 >
                                    <CheckCircle2 size={18} />
                                 </button>
                                 <button 
                                    onClick={() => handleUpdateReportStatus(report.id, 'DISMISSED')}
                                    className="p-2 bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white rounded-lg transition-all"
                                 >
                                    <Ban size={18} />
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
        </>
      )}

      {/* Editing Modal for Multiple Roles */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="bg-brand-card w-full max-w-lg rounded-[2rem] border border-brand-border p-8 relative z-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Modificar Credenciais</h3>
            <p className="text-gray-400 text-sm mb-6 font-bold">Editando: <span className="text-brand-primary">{editingUser.name}</span></p>
            
            <div className="space-y-3">
              {[
                { role: "USER", title: "Operador", icon: <User className="text-gray-400" /> },
                { role: "PREMIUM", title: "Doador", icon: <BadgeCheck className="text-yellow-500" /> },
                { role: "FIELD_OWNER", title: "Dono de Campo", icon: <Store className="text-brand-primary" /> },
                { role: "ADMIN", title: "Administrador", icon: <ShieldAlert className="text-red-500" /> }
              ].map(r => {
                // 🛡️ TRAVA 5: Blindado no modal de edição
                const hasRole = (editingUser.roles || []).includes(r.role as UserRole);
                return (
                  <button
                    key={r.role}
                    onClick={() => toggleRoleForEditingUser(r.role as UserRole)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all ${
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

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setEditingUser(null)} className="py-4 rounded-xl border border-brand-border text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                Cancelar
              </button>
              <button onClick={saveRoles} className="py-4 rounded-xl bg-brand-primary text-black hover:bg-brand-primary-light text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                <Check size={16}/> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;