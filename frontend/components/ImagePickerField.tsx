import React, { useEffect, useState } from "react";
import { Camera, ImageIcon } from "lucide-react";

interface Props {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  current?: string | null;
  sizeClass?: string;
  className?: string;
}

const ImagePickerField: React.FC<Props> = ({
  label,
  file,
  onChange,
  current,
  sizeClass = "aspect-square",
  className = "",
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || current || null;

  return (
    <label
      className={`relative cursor-pointer group flex items-center justify-center overflow-hidden border-2 border-dashed rounded-xl transition-colors ${sizeClass} ${
        shown ? "border-brand-primary/60" : "border-brand-border hover:border-brand-primary/50"
      } ${className}`}
    >
      {shown ? (
        <img src={shown} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-gray-500">
          <ImageIcon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">{label}</span>
        </div>
      )}

      {shown && (
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
          <Camera size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">
            {file ? "Trocar imagem" : label}
          </span>
        </div>
      )}

      {file && (
        <span className="absolute top-2 left-2 bg-brand-primary text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-lg">
          Nova
        </span>
      )}

      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
};

export default ImagePickerField;
