import { describe, it, expect } from "vitest";
import { parsePagination, buildPage } from "./pagination";

describe("parsePagination", () => {
  it("usa os defaults quando a query não traz page/limit", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it("calcula skip a partir de page/limit", () => {
    expect(parsePagination({ page: "3", limit: "10" })).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it("nunca deixa page cair abaixo de 1", () => {
    expect(parsePagination({ page: "0" }).page).toBe(1);
    expect(parsePagination({ page: "-5" }).page).toBe(1);
  });

  it("limita o limit ao máximo de 100 (evita pedir a tabela inteira de uma vez)", () => {
    expect(parsePagination({ limit: "9999" }).limit).toBe(100);
  });

  it("limit '0' cai no default — o '||' trata 0 como ausente, não como um limit explícito", () => {
    expect(parsePagination({ limit: "0" }).limit).toBe(20);
  });

  it("nunca deixa um limit negativo passar — vira 1", () => {
    expect(parsePagination({ limit: "-5" }).limit).toBe(1);
  });

  it("ignora valores não numéricos e cai no default", () => {
    expect(parsePagination({ page: "abc", limit: "xyz" })).toEqual({ page: 1, limit: 20, skip: 0 });
  });
});

describe("buildPage", () => {
  it("monta o envelope de paginação com totalPages arredondado pra cima", () => {
    expect(buildPage(["a", "b"], 45, 2, 20)).toEqual({
      items: ["a", "b"],
      total: 45,
      page: 2,
      limit: 20,
      totalPages: 3,
    });
  });

  it("totalPages nunca fica abaixo de 1, mesmo com total 0", () => {
    expect(buildPage([], 0, 1, 20).totalPages).toBe(1);
  });
});
