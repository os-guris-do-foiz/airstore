export interface WearInfo {
  code: "FN" | "MW" | "FT" | "WW" | "BS";
  label: string;   // rótulo curto exibido no badge
  full: string;    // rótulo completo original
  color: string;   // cor do tier (hex)
  tier: number;    // 0 (nova) → 4 (destruída)
  floatPct: number; // posição 0–100 na barra de float
  floatValue: string; // valor "float" fake estilo CS (0.00–1.00)
}

const TIERS: Record<WearInfo["code"], Omit<WearInfo, "full" | "floatValue">> = {
  FN: { code: "FN", label: "Nova de Fábrica", color: "#ef4444", tier: 0, floatPct: 4 },
  MW: { code: "MW", label: "Pouco Usada", color: "#fb923c", tier: 1, floatPct: 15 },
  FT: { code: "FT", label: "Testada em Campo", color: "#facc15", tier: 2, floatPct: 34 },
  WW: { code: "WW", label: "Bem Desgastada", color: "#4ade80", tier: 3, floatPct: 56 },
  BS: { code: "BS", label: "Veterana de Guerra", color: "#22d3ee", tier: 4, floatPct: 82 },
};

export const WEAR_SCALE = Object.values(TIERS);

export const conditionLabel = (code: WearInfo["code"]) => `${TIERS[code].label} (${code})`;
export const CONDITION_OPTIONS = (Object.keys(TIERS) as WearInfo["code"][]).map((code) => ({
  code,
  color: TIERS[code].color,
  label: conditionLabel(code),
}));

export function getWear(condition?: string | null): WearInfo | null {
  if (!condition) return null;
  const c = condition.toLowerCase().trim();

  if (c === "n/a" || c === "-") return null;

  const codeMatch = condition.match(/\((FN|MW|FT|WW|BS)\)/i);
  let key = codeMatch?.[1]?.toUpperCase() as WearInfo["code"] | undefined;

  if (!key) {
    if (c.includes("fábrica") || c.includes("fabrica") || c === "novo" || c === "nova") key = "FN";
    else if (c.includes("pouco") || c.includes("seminovo") || c.includes("semi-novo")) key = "MW";
    else if (c.includes("testada") || c.includes("campo") || c.includes("usado") || c.includes("usada")) key = "FT";
    else if (c.includes("desgastada")) key = "WW";
    else if (c.includes("veterana") || c.includes("guerra") || c.includes("sucata")) key = "BS";
  }

  if (!key || !TIERS[key]) return null;

  const base = TIERS[key];
  return {
    ...base,
    full: condition,
    floatValue: (base.floatPct / 100).toFixed(2),
  };
}
