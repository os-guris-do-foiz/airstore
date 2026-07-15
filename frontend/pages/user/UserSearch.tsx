import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, Users, Hash, AtSign, MapPin, ShieldAlert, Store, BadgeCheck } from "lucide-react";
import { usersApi, AppUser } from "../../api/users";
import Pagination from "../../components/Pagination";

const roleBadge = (r: string) => {
  switch (r) {
    case "ADMIN": return <span key={r} className="flex items-center gap-1 bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[9px] font-black tracking-widest"><ShieldAlert size={9} /> ADMIN</span>;
    case "FIELD_OWNER": return <span key={r} className="flex items-center gap-1 bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded text-[9px] font-black tracking-widest"><Store size={9} /> DONO</span>;
    case "PREMIUM": return <span key={r} className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[9px] font-black tracking-widest"><BadgeCheck size={9} /> DOADOR</span>;
    default: return null;
  }
};

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      usersApi
        .search(q, page)
        .then((data) => { setResults(data.items); setTotalPages(data.totalPages); })
        .catch(() => setResults([]))
        .finally(() => { setLoading(false); setSearched(true); });
    }, 350);
    return () => clearTimeout(t);
  }, [query, page]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 tactical-panel-sm bg-brand-primary/10 border border-brand-primary/20 mb-4">
          <Users className="text-brand-primary" size={26} />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Buscar Operadores</h1>
        <p className="text-gray-500 mt-2 text-sm">Procure por nome, apelido ou pelo ID (use <span className="text-brand-primary font-mono">#id</span>).</p>
      </div>

      <div className="relative mb-8">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Ghost   ou   #a1b2c3d4e"
          className="w-full bg-brand-card border border-brand-border tactical-panel-sm pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none text-lg"
        />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-brand-primary" size={20} />}
      </div>

      {!query.trim() ? (
        <div className="text-center py-16 text-gray-600 text-sm italic">
          Digite algo para começar a busca.
        </div>
      ) : searched && results.length === 0 && !loading ? (
        <div className="text-center py-16 space-y-3">
          <Users className="mx-auto text-brand-border" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Nenhum operador encontrado</p>
          <p className="text-gray-600 text-xs">Tente outro nome ou o ID exato com #.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((u) => (
            <Link
              key={u.id}
              to={`/profile/${u.id}`}
              className="flex items-center gap-4 bg-brand-card border border-brand-border hover:border-brand-primary/50 tactical-panel-sm p-4 transition-colors group"
            >
              <img
                src={u.avatar || "https://picsum.photos/seed/" + u.id + "/100"}
                referrerPolicy="no-referrer"
                className="w-14 h-14 tactical-panel-xs object-cover border border-brand-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-black tracking-tight group-hover:text-brand-primary transition-colors truncate">{u.name}</span>
                  {(u.roles || []).map(roleBadge)}
                  {u.status === "BANNED" && <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[9px] font-black tracking-widest">BANIDO</span>}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                  {u.nickname && <span className="flex items-center gap-0.5"><AtSign size={11} />{u.nickname}</span>}
                  <span className="flex items-center gap-0.5 font-mono"><Hash size={11} />{u.id}</span>
                </div>
              </div>
              <span className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-black uppercase tracking-widest shrink-0">Ver →</span>
            </Link>
          ))}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default UserSearch;
