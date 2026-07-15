import { describe, it, expect } from "vitest";
import { calculateDonorExpiry, REAIS_PER_WEEK } from "./donationService";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

describe("calculateDonorExpiry (regra: a cada R$10, 1 semana de destaque)", () => {
  it("doação abaixo de R$10 não gera nenhuma semana", () => {
    expect(calculateDonorExpiry(null, 9).weeks).toBe(0);
    expect(calculateDonorExpiry(null, 9).newExpiry).toBeNull();
  });

  it("arredonda pra baixo — R$19 vale 1 semana, não 2", () => {
    expect(calculateDonorExpiry(null, 19).weeks).toBe(1);
  });

  it("R$10 exatos vale exatamente 1 semana", () => {
    expect(calculateDonorExpiry(null, REAIS_PER_WEEK).weeks).toBe(1);
  });

  it("sem prazo anterior, conta a partir de agora", () => {
    const now = Date.now();
    const { newExpiry } = calculateDonorExpiry(null, 20, now);
    expect(newExpiry!.getTime()).toBe(now + 2 * WEEK_MS);
  });

  it("com prazo futuro existente, a nova doação SOMA em cima dele (não reinicia)", () => {
    const now = Date.now();
    const currentExpiry = new Date(now + 3 * DAY_MS); // já tem 3 dias de doador restantes
    const { newExpiry } = calculateDonorExpiry(currentExpiry, 10, now); // +1 semana
    expect(newExpiry!.getTime()).toBe(currentExpiry.getTime() + WEEK_MS);
  });

  it("com prazo já vencido (no passado), conta a partir de agora — não do prazo velho", () => {
    const now = Date.now();
    const expiredExpiry = new Date(now - 30 * DAY_MS);
    const { newExpiry } = calculateDonorExpiry(expiredExpiry, 10, now);
    expect(newExpiry!.getTime()).toBe(now + WEEK_MS);
  });
});
