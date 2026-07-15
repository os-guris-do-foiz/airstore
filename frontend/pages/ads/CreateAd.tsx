import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, AlertCircle, Loader2, X } from "lucide-react";
import { adsApi } from "../../api/ads";
import { CATEGORY_OPTIONS, MODEL_OPTIONS, TYPE_OPTIONS } from "../../utils/adOptions";
import { CONDITION_OPTIONS } from "../../utils/wear";

const CreateAd: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    whatsapp: "",
    location: "",
    model: MODEL_OPTIONS[0],
    type: TYPE_OPTIONS[0],
    category: "Airsoft",
    condition: "",
    brand: "",
    fps: "",
    accepts_trade: false,
  });

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      model: category === "Airsoft" ? (prev.model || MODEL_OPTIONS[0]) : "",
      type: category === "Airsoft" ? (prev.type || TYPE_OPTIONS[0]) : "",
      fps: category === "Airsoft" ? prev.fps : "",
      condition: category === "Serviços" ? "" : prev.condition,
      brand: category === "Serviços" ? "" : prev.brand,
    }));
  };

  const MAX_IMAGES = 10;
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, padrão aceitável para imagens de e-commerce

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    e.target.value = "";

    const oversized = newFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      setError(`A imagem "${oversized.name}" excede o tamanho máximo de 5MB.`);
      return;
    }

    const combined = [...imageFiles, ...newFiles];
    if (combined.length > MAX_IMAGES) {
      setError(`Você pode enviar no máximo ${MAX_IMAGES} imagens por anúncio. Você já tem ${imageFiles.length} e tentou adicionar mais ${newFiles.length}.`);
      return;
    }

    setError(null);
    setImageFiles(combined);
  };

  const showError = (message: string) => {
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const currentUserStr = localStorage.getItem("fronteira_user");
    if (!currentUserStr) {
      showError("Você precisa estar logado para anunciar.");
      return;
    }

    if (formData.category !== "Serviços" && !formData.condition) {
      showError("Selecione o estado de conservação do equipamento.");
      return;
    }

    setLoading(true);

    const normalized =
      formData.category === "Serviços"
        ? { ...formData, type: "Serviços", model: "N/A", brand: "N/A", fps: "N/A", condition: "N/A" }
        : formData;

    const payload = new FormData();
    Object.entries(normalized).forEach(([key, value]) => {
      payload.append(key, String(value));
    });
    imageFiles.forEach((file) => payload.append("images", file));

    try {
      const res = await adsApi.create(payload as any);
      navigate(`/ads/${res.id}`);
    } catch (err: any) {
      showError(err.message || "Falha ao criar anúncio. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">
          Criar Anúncio
        </h1>
        <p className="text-gray-400">
          Preencha os detalhes do seu equipamento para começar a vender na Fronteira.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 tactical-panel-xs text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-card p-6 md:p-8 tactical-panel border border-gray-800 space-y-6 shadow-xl">
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Título do Anúncio
              </label>
              <input
                required
                type="text"
                className="input-field w-full h-12"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: M4A1 Full Metal Upgrade Maple Leaf"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Descrição Detalhada
              </label>
              <textarea
                required
                rows={8}
                className="input-field w-full resize-none py-4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva o produto, upgrades, tempo de uso, o que acompanha, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Preço (R$)
                </label>
                <input
                  required
                  type="number"
                  className="input-field w-full h-12"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  WhatsApp (com DDD)
                </label>
                <input
                  required
                  type="text"
                  className="input-field w-full h-12"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder="Ex: 45999999999"
                />
              </div>
            </div>
          </div>

          <div className="bg-brand-card p-6 md:p-8 tactical-panel border border-gray-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-black uppercase tracking-tight text-xl">
                Galeria de Fotos
              </h3>
              <span
                className={`text-xs font-bold uppercase tracking-widest ${
                  imageFiles.length >= MAX_IMAGES ? "text-red-500" : "text-gray-500"
                }`}
              >
                {imageFiles.length}/{MAX_IMAGES}
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {imageFiles.length < MAX_IMAGES && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square tactical-panel-sm border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer bg-brand-bg/50"
                >
                  <Camera size={32} />
                  <span className="text-[10px] font-bold uppercase text-center px-2">
                    Adicionar Foto
                  </span>
                </div>
              )}

              {imageFiles.map((file, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover tactical-panel-xs"
                    alt={`Preview ${i}`}
                  />
                  <button
                    type="button"
                    onClick={() => { setError(null); setImageFiles(imageFiles.filter((_, idx) => idx !== i)); }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 transition-colors rounded-full p-1 text-white shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 text-gray-500">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-[10px] uppercase font-bold">
                Máximo de {MAX_IMAGES} fotos, até 5MB cada. Fotos reais e bem iluminadas aumentam a chance de venda.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-card p-6 md:p-8 tactical-panel border border-gray-800 space-y-6 shadow-xl sticky top-24">
            <h3 className="text-white font-black uppercase tracking-tight text-xl">
              Equipamento
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Categoria Principal
                </label>
                <select
                  className="input-field w-full h-10 text-sm bg-brand-card"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {formData.category !== "Serviços" && (
                <div className="space-y-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Estado de Conservação <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {CONDITION_OPTIONS.map((c) => {
                      const selected = formData.condition === c.label;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setFormData({ ...formData, condition: c.label })}
                          className="tactical-panel-xs flex items-center gap-2 px-3 py-2 border text-left transition-all"
                          style={
                            selected
                              ? { background: `${c.color}22`, borderColor: c.color, color: c.color }
                              : { borderColor: "var(--color-brand-border)", color: "#9ca3af" }
                          }
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color, boxShadow: selected ? `0 0 6px ${c.color}` : undefined }} />
                          <span className="text-xs font-bold uppercase tracking-wide">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!formData.condition && (
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                      Obrigatório — define a cor de desgaste do anúncio.
                    </p>
                  )}
                </div>
              )}

              {formData.category !== "Serviços" && (
                <div className="space-y-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Fabricante / Marca
                  </label>
                  <input
                    type="text"
                    className="input-field w-full h-10 text-sm"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Ex: G&G, WE, VFC"
                  />
                </div>
              )}

              {formData.category === "Airsoft" && (
                <>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Modelo Base
                    </label>
                    <select
                      className="input-field w-full h-10 text-sm bg-brand-card"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    >
                      {MODEL_OPTIONS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      Sistema
                    </label>
                    <select
                      className="input-field w-full h-10 text-sm bg-brand-card"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      FPS (Aproximado)
                    </label>
                    <input
                      type="number"
                      className="input-field w-full h-10 text-sm"
                      value={formData.fps}
                      onChange={(e) =>
                        setFormData({ ...formData, fps: e.target.value })
                      }
                      placeholder="Ex: 380"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Localização da Venda
                </label>
                <input
                  required
                  type="text"
                  className="input-field w-full h-10 text-sm"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ex: Curitiba, PR"
                />
              </div>

              {formData.category !== "Serviços" && (
                <div className="space-y-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Negocia Troca?
                  </label>
                  <select
                    className="input-field w-full h-10 text-sm bg-brand-card"
                    value={formData.accepts_trade.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accepts_trade: e.target.value === "true",
                      })
                    }
                  >
                    <option value="false">Não aceito trocas</option>
                    <option value="true">Sim, aceito propostas</option>
                  </select>
                </div>
              )}
              


            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-14 text-lg mt-4 font-black uppercase tracking-tighter flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : "PUBLICAR OPERAÇÃO"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAd;