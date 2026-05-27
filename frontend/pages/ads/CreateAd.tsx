import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, AlertCircle, Loader2, X } from "lucide-react";
import { adsApi } from "../../api/ads";

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
    model: "M4",
    type: "AEG",
    category: "Airsoft",
    condition: "Novo",
    brand: "",
    fps: "",
    accepts_trade: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const currentUserStr = localStorage.getItem("fronteira_user");
    if (!currentUserStr) {
      setError("Você precisa estar logado para anunciar.");
      setLoading(false);
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, String(value));
    });
    imageFiles.forEach((file) => payload.append("images", file));

    try {
      const res = await adsApi.create(payload as any);
      navigate(`/ads/${res.id}`);
    } catch (err: any) {
      setError(err.message || "Falha ao criar anúncio. Verifique os dados.");
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
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Coluna Esquerda: Informações Principais e Galeria */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-card p-6 md:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl">
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

          {/* Galeria de Fotos com Upload */}
          <div className="bg-brand-card p-6 md:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl">
            <h3 className="text-white font-black uppercase tracking-tight text-xl">
              Galeria de Fotos
            </h3>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer bg-brand-bg/50"
              >
                <Camera size={32} />
                <span className="text-[10px] font-bold uppercase text-center px-2">
                  Adicionar Foto
                </span>
              </div>
              
              {imageFiles.map((file, i) => (
                <div key={i} className="relative aspect-square">
                  <img 
                    src={URL.createObjectURL(file)} 
                    className="w-full h-full object-cover rounded-xl" 
                    alt={`Preview ${i}`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))} 
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
                Dica: Fotos reais e bem iluminadas aumentam a chance de venda.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Especificações e Botão */}
        <div className="space-y-6">
          <div className="bg-brand-card p-6 md:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl sticky top-24">
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
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Airsoft">Airsoft / Marcadores</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Peças">Peças e Upgrades</option>
                  <option value="Serviços">Serviços / Armeiro</option>
                  <option value="Kits">Kits Completos</option>
                </select>
              </div>

              {formData.category !== "Serviços" && (
                <div className="space-y-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Estado de Conservação
                  </label>
                  <select
                    className="input-field w-full h-10 text-sm bg-brand-card"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  >
                    <option value="Fábrica Nova (FN)">Fábrica Nova (FN)</option>
                    <option value="Pouco Usada (MW)">Pouco Usada (MW)</option>
                    <option value="Testada em Campo (FT)">Testada em Campo (FT)</option>
                    <option value="Bem Desgastada (WW)">Bem Desgastada (WW)</option>
                    <option value="Veterana de Guerra (BS)">Veterana de Guerra (BS)</option>
                  </select>
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
                      <option>M4</option>
                      <option>AK47</option>
                      <option>Pistola</option>
                      <option>Sniper</option>
                      <option>Shotgun</option>
                      <option>SMG</option>
                      <option>LMG/Suporte</option>
                      <option>Outros</option>
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
                      <option>AEG</option>
                      <option>GBB (Gás)</option>
                      <option>Spring (Mola)</option>
                      <option>HPA</option>
                      <option>CO2</option>
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