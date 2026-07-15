import { describe, it, expect } from "vitest";
import { getWear, CONDITION_OPTIONS, WEAR_SCALE, conditionLabel } from "./wear";

describe("getWear", () => {
  it("retorna null para condição vazia, N/A ou serviço", () => {
    expect(getWear(null)).toBeNull();
    expect(getWear(undefined)).toBeNull();
    expect(getWear("")).toBeNull();
    expect(getWear("N/A")).toBeNull();
    expect(getWear("-")).toBeNull();
  });

  it("resolve pelo código entre parênteses (fonte canônica do formulário)", () => {
    expect(getWear("Nova de Fábrica (FN)")?.code).toBe("FN");
    expect(getWear("Pouco Usada (MW)")?.code).toBe("MW");
    expect(getWear("Testada em Campo (FT)")?.code).toBe("FT");
    expect(getWear("Bem Desgastada (WW)")?.code).toBe("WW");
    expect(getWear("Veterana de Guerra (BS)")?.code).toBe("BS");
  });

  it("cai no fallback por palavra-chave para textos livres de anúncios antigos", () => {
    expect(getWear("Seminovo")?.code).toBe("MW");
    expect(getWear("Semi-novo")?.code).toBe("MW");
    expect(getWear("Usado")?.code).toBe("FT");
    expect(getWear("Usada")?.code).toBe("FT");
    expect(getWear("Novo")?.code).toBe("FN");
    expect(getWear("Sucata")?.code).toBe("BS");
  });

  it("não reconhece um texto sem nenhuma palavra-chave conhecida", () => {
    expect(getWear("Estado desconhecido")).toBeNull();
  });

  it("guarda o texto original em `full` e calcula floatValue a partir do floatPct", () => {
    const wear = getWear("Nova de Fábrica (FN)");
    expect(wear?.full).toBe("Nova de Fábrica (FN)");
    expect(wear?.floatValue).toBe((wear!.floatPct / 100).toFixed(2));
  });
});

describe("CONDITION_OPTIONS / WEAR_SCALE / conditionLabel", () => {
  it("tem exatamente as 5 opções canônicas, em ordem de tier crescente", () => {
    expect(CONDITION_OPTIONS.map((o) => o.code)).toEqual(["FN", "MW", "FT", "WW", "BS"]);
    expect(WEAR_SCALE.map((t) => t.tier)).toEqual([0, 1, 2, 3, 4]);
  });

  it("cada label de CONDITION_OPTIONS bate com o código quando resolvido de volta por getWear", () => {
    for (const opt of CONDITION_OPTIONS) {
      expect(getWear(opt.label)?.code).toBe(opt.code);
    }
  });

  it("conditionLabel formata como 'Rótulo (CÓDIGO)'", () => {
    expect(conditionLabel("FN")).toBe("Nova de Fábrica (FN)");
  });
});
