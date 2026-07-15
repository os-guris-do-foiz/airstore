import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Save, Loader2, ChevronLeft, Camera, X, ShieldAlert, Store, Trash2
} from "lucide-react";
import { fieldsApi, Field } from "../../api/fields";
import { usersApi, AppUser } from "../../api/users";
import { authApi } from "../../api/auth";
import { onImgError } from "../../utils/img";
import { getCurrentUser } from "../../utils/auth";
import { toast } from "../../utils/toast";
import { confirmDialog } from "../../utils/confirm";
import ImagePickerField from "../../components/ImagePickerField";

const PainelCampoConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin = !!currentUser?.roles?.includes("ADMIN");
  const isFieldOwner = !!currentUser?.roles?.includes("FIELD_OWNER");
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<Field | null>(null);
  const [owners, setOwners] = useState<AppUser[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [quota, setQuota] = useState<{ owned: number; limit: number } | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: "",
    base_price: "",
    rental_price: "",
    whatsapp: "",
    rules: "",
    infrastructure: "",
  });
  const [ownerIds, setOwnerIds] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin) {
      usersApi
        .getAll({ limit: 100 })
        .then((all) => setOwners(all.items.filter((u) => (u.roles || []).includes("FIELD_OWNER"))))
        .catch(() => setOwners([]));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isEdit || isAdmin || !isFieldOwner) return;
    Promise.all([authApi.me(), fieldsApi.getMine()])
      .then(([me, mine]) => setQuota({ owned: mine.length, limit: me.field_limit ?? 0 }))
      .catch(() => setQuota(null));
  }, [isEdit, isAdmin, isFieldOwner]);

  const quotaBlocked = !isEdit && !isAdmin && !!quota && (quota.limit <= 0 || quota.owned >= quota.limit);

  useEffect(() => {
    if (!id) return;
    fieldsApi
      .getById(id)
      .then((f) => {
        setExisting(f);
        setForm({
          name: f.name || "",
          type: f.type || "",
          location: f.location || "",
          description: f.description || "",
          base_price: String(f.base_price ?? ""),
          rental_price: String(f.rental_price ?? ""),
          whatsapp: f.whatsapp || "",
          rules: (f.rules || []).join("\n"),
          infrastructure: (f.infrastructure || []).join("\n"),
        });
        setOwnerIds(f.owner_ids || []);
      })
      .catch(() => setError("Campo não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = isEdit
    ? isAdmin || (existing != null && existing.owner_ids.includes(currentUser?.id || ""))
    : isAdmin || isFieldOwner;

  const toggleOwner = (uid: string) =>
    setOwnerIds((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("type", form.type);
    payload.append("location", form.location);
    payload.append("description", form.description);
    payload.append("base_price", form.base_price || "0");
    payload.append("rental_price", form.rental_price || "0");
    payload.append("whatsapp", form.whatsapp);
    payload.append("rules", form.rules);
    payload.append("infrastructure", form.infrastructure);
    if (isAdmin) payload.append("owner_ids", JSON.stringify(ownerIds));
    if (coverFile) payload.append("cover", coverFile);
    imageFiles.forEach((file) => payload.append("images", file));

    try {
      if (isEdit && id) {
        await fieldsApi.update(id, payload);
        toast.success("Campo atualizado com sucesso!");
        navigate(`/campos/${id}`);
      } else {
        const created = await fieldsApi.create(payload);
        toast.success("Campo criado com sucesso! 🎯");
        navigate(`/campos/${created.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Falha ao salvar o campo.");
      toast.error(err.message || "Falha ao salvar o campo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!(await confirmDialog({ title: "Excluir campo", message: "Excluir este campo? Todas as partidas serão removidas.", confirmText: "Excluir", danger: true }))) return;
    try {
      await fieldsApi.delete(id);
      navigate("/campos");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldAlert className="text-red-500" size={60} />
        <h2 className="text-2xl font-black text-white uppercase">Acesso Restrito</h2>
        <p className="text-gray-400 max-w-sm">
          {isEdit ? "Você não é o dono deste campo." : "Apenas Administradores podem cadastrar campos."}
        </p>
        <Link to="/campos" className="text-brand-primary font-bold uppercase text-xs tracking-widest">← Ver campos</Link>
      </div>
    );
  }

  const input = "w-full bg-brand-bg border border-brand-border tactical-panel-xs p-4 text-white placeholder-gray-600 focus:border-brand-primary outline-none transition-all";
  const labelCls = "text-xs font-bold text-gray-500 uppercase tracking-widest";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pt-24">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="bg-brand-bg border border-brand-border hover:border-brand-primary text-white p-2.5 tactical-panel-xs transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            {isEdit ? "Editar Campo" : "Cadastrar Campo"}
          </h1>
          <p className="text-gray-400 text-sm">
            {isEdit ? "Atualize as informações do campo." : "Preencha os dados e vincule a um Dono de Campo."}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm tactical-panel-xs p-4 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelCls}>Nome do Campo</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Base Alpha CQB" className={input} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Tipo</label>
            <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Ex: CQB, MATA, MISTO" className={input} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Localização</label>
          <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex: Zona Oeste, São Paulo - SP" className={input} />
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Descrição</label>
          <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o campo, o cenário, o estilo de jogo..." className={input} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className={labelCls}>Entrada Próprio (R$)</label>
            <input type="number" min={0} step="0.01" required value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} placeholder="20" className={input} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Adicional Locação (R$)</label>
            <input type="number" min={0} step="0.01" value={form.rental_price} onChange={(e) => setForm({ ...form, rental_price: e.target.value })} placeholder="50" className={input} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>WhatsApp</label>
            <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 90000-0000" className={input} />
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-2">
            <label className={labelCls}><Store size={12} className="inline mr-1" /> Donos do Campo (pode escolher vários)</label>
            {owners.length === 0 ? (
              <p className="text-[11px] text-gray-500 border border-dashed border-brand-border tactical-panel-xs p-4">
                Nenhum usuário com cargo "Dono de Campo". Atribua o cargo no Painel Admin primeiro.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-brand-border tactical-panel-xs p-3 bg-brand-bg">
                {owners.map((o) => {
                  const on = ownerIds.includes(o.id);
                  return (
                    <button
                      type="button" key={o.id}
                      onClick={() => toggleOwner(o.id)}
                      className={`text-left flex items-center gap-3 p-3 tactical-panel-xs border transition-all ${on ? "bg-brand-primary/10 border-brand-primary" : "bg-brand-card border-brand-border hover:border-gray-600"}`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${on ? "bg-brand-primary text-black" : "border border-gray-600"}`}>
                        {on && <Store size={10} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${on ? "text-white" : "text-gray-400"}`}>{o.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{o.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-gray-500">Nenhum selecionado = campo sem dono.</p>
          </div>
        )}

        {!isAdmin && !isEdit && quota && (
          <div className={`tactical-panel-sm p-5 border ${quotaBlocked ? "bg-red-500/5 border-red-500/30" : "bg-brand-primary/5 border-brand-primary/25"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${quotaBlocked ? "text-red-400" : "text-brand-primary"}`}>
                <Store size={14} /> Sua cota de campos
              </span>
              <span className={`text-sm font-black ${quotaBlocked ? "text-red-400" : "text-white"}`}>
                {quota.owned} / {quota.limit}
              </span>
            </div>
            <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${quotaBlocked ? "bg-red-500" : "bg-brand-primary"}`}
                style={{ width: `${quota.limit > 0 ? Math.min(100, (quota.owned / quota.limit) * 100) : 100}%` }}
              />
            </div>
            {quota.limit <= 0 ? (
              <p className="text-xs text-red-400 leading-relaxed">
                Você ainda não tem permissão para criar campos. Peça a um Administrador para liberar sua cota.
              </p>
            ) : quotaBlocked ? (
              <p className="text-xs text-red-400 leading-relaxed">
                Limite atingido: você já criou <b>{quota.owned}</b> de <b>{quota.limit}</b> campos permitidos. Fale com um Administrador para aumentar.
              </p>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">
                Você já criou <b className="text-white">{quota.owned}</b> de <b className="text-white">{quota.limit}</b> campos. Ainda pode criar mais <b className="text-brand-primary">{quota.limit - quota.owned}</b>. Você será registrado como dono automaticamente.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelCls}>Regras (uma por linha)</label>
            <textarea rows={5} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder={"FPS Máximo: 350\nApenas Semi-Auto no CQB"} className={input} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Infraestrutura (uma por linha)</label>
            <textarea rows={5} value={form.infrastructure} onChange={(e) => setForm({ ...form, infrastructure: e.target.value })} placeholder={"Estacionamento\nLanchonete\nBanheiros"} className={input} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Foto de Capa</label>
          <p className="text-[11px] text-gray-500">Aparece como miniatura na página de campos e como fundo no detalhe.</p>
          <ImagePickerField label="Escolher foto de capa" file={coverFile} onChange={setCoverFile} current={existing?.cover} sizeClass="h-40" />
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Galeria de Imagens</label>

          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-1">
              {imageFiles.map((file, i) => (
                <div key={i} className="relative aspect-square tactical-panel-xs overflow-hidden border border-brand-primary/50">
                  <img src={URL.createObjectURL(file)} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white tactical-panel-xs p-1 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isEdit && existing && existing.images.length > 0 && imageFiles.length === 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-1">
              {existing.images.map((img, i) => (
                <img key={i} src={img} onError={onImgError} className="w-full aspect-square object-cover tactical-panel-xs border border-brand-border opacity-80" alt={`Atual ${i + 1}`} />
              ))}
            </div>
          )}
          {isEdit && existing && existing.images.length > 0 && imageFiles.length === 0 && (
            <p className="text-[11px] text-gray-500">Imagens atuais. Enviar novas <b>substitui</b> todas.</p>
          )}

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-border tactical-panel-sm p-6 cursor-pointer hover:border-brand-primary/50 transition-colors">
            <Camera size={26} className="text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {imageFiles.length > 0 ? `${imageFiles.length} imagem(ns) selecionada(s) — clique para trocar` : "Clique para enviar imagens"}
            </span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))} />
          </label>
          {imageFiles.length > 0 && (
            <button type="button" onClick={() => setImageFiles([])} className="text-red-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
              <X size={12} /> Limpar seleção
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="submit" disabled={saving || quotaBlocked} className="flex-1 bg-brand-primary text-black hover:bg-brand-primary-light tactical-panel-xs py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="animate-spin" size={18} /> : quotaBlocked ? "Cota Esgotada" : <><Save size={16} /> {isEdit ? "Salvar Alterações" : "Cadastrar Campo"}</>}
          </button>
          {isEdit && isAdmin && (
            <button type="button" onClick={handleDelete} className="px-6 py-4 tactical-panel-xs border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all">
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PainelCampoConfig;
