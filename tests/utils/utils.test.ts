import {
  formatMoney,
  parseMoney,
  convertRate,
  calcIRRate,
  validateFinancialParams,
  formatPeriod,
  calcPercentDifference,
} from "../../src/utils/utils";

/* ================= */
/*   formatMoney()   */
/* ================= */

describe("formatMoney", () => {
  test("deve formatar número para moeda brasileira", () => {
    expect(formatMoney(1000)).toBe("R$ 1.000,00");
    expect(formatMoney(1000.5)).toBe("R$ 1.000,50");
    expect(formatMoney(0)).toBe("R$ 0,00");
  });

  test("deve formatar números negativos", () => {
    expect(formatMoney(-500)).toBe("-R$ 500,00");
  });

  test("deve formatar números grandes", () => {
    expect(formatMoney(1000000)).toBe("R$ 1.000.000,00");
  });
});

/* ================ */
/*   parseMoney()   */
/* ================ */

describe("parseMoney", () => {
  test("deve converter string de moeda para número", () => {
    expect(parseMoney("R$ 1.000,00")).toBe(1000);
    expect(parseMoney("R$ 1.000,50")).toBe(1000.5);
    expect(parseMoney("R$ 0,00")).toBe(0);
  });

  test("deve retornar número quando entrada já é número", () => {
    expect(parseMoney(1000)).toBe(1000);
    expect(parseMoney(1000.5)).toBe(1000.5);
  });
});

/* ================= */
/*   convertRate()   */
/* ================= */

describe("convertRate", () => {
  test("deve converter taxa anual para mensal", () => {
    const result = convertRate(12, "anual", "mensal");
    expect(result).toBeCloseTo(0.949, 2);
  });

  test("deve converter taxa mensal para anual", () => {
    const result = convertRate(1, "mensal", "anual");
    expect(result).toBeCloseTo(12.68, 2);
  });

  test("deve retornar a mesma taxa quando conversão é igual", () => {
    expect(convertRate(10, "anual", "anual")).toBe(10);
    expect(convertRate(1, "mensal", "mensal")).toBe(1);
  });
});

/* ================ */
/*   calcIRRate()   */
/* ================ */

describe("calcIRRate", () => {
  test("deve retornar alíquota correta baseada nos dias", () => {
    expect(calcIRRate(180)).toBe(22.5);
    expect(calcIRRate(360)).toBe(20);
    expect(calcIRRate(720)).toBe(17.5);
    expect(calcIRRate(800)).toBe(15);
  });

  test("deve retornar alíquota para casos extremos", () => {
    expect(calcIRRate(1)).toBe(22.5);
    expect(calcIRRate(1000)).toBe(15);
  });
});

/* ============================= */
/*   validateFinancialParams()   */
/* ============================= */

describe("validateFinancialParams", () => {
  test("deve validar parâmetros corretos", () => {
    const result = validateFinancialParams(1000, 10, 12);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("deve rejeitar valor negativo", () => {
    const result = validateFinancialParams(-1000, 10, 12);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Valor deve ser um número positivo");
  });

  test("deve rejeitar taxa negativa", () => {
    const result = validateFinancialParams(1000, -10, 12);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Taxa deve ser um número positivo ou zero");
  });

  test("deve rejeitar tempo negativo", () => {
    const result = validateFinancialParams(1000, 10, -12);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Tempo deve ser um número positivo");
  });

  test("deve rejeitar múltiplos parâmetros inválidos", () => {
    const result = validateFinancialParams(-1000, -10, -12);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

/* ================== */
/*   formatPeriod()   */
/* ================== */

describe("formatPeriod", () => {
  test("deve formatar meses corretamente", () => {
    expect(formatPeriod(1)).toBe("1 mês");
    expect(formatPeriod(6)).toBe("6 meses");
    expect(formatPeriod(11)).toBe("11 meses");
  });

  test("deve formatar anos corretamente", () => {
    expect(formatPeriod(12)).toBe("1 ano");
    expect(formatPeriod(24)).toBe("2 anos");
    expect(formatPeriod(36)).toBe("3 anos");
  });

  test("deve formatar anos e meses combinados", () => {
    expect(formatPeriod(13)).toBe("1 ano e 1 mês");
    expect(formatPeriod(25)).toBe("2 anos e 1 mês");
    expect(formatPeriod(38)).toBe("3 anos e 2 meses");
  });
});

/* =========================== */
/*   calcPercentDifference()   */
/* =========================== */

describe("calcPercentDifference", () => {
  test("deve calcular diferença percentual correta", () => {
    expect(calcPercentDifference(110, 100)).toBe(10); // 10% de aumento
    expect(calcPercentDifference(90, 100)).toBe(-10); // 10% de redução
    expect(calcPercentDifference(100, 100)).toBe(0); // sem diferença
  });

  test("deve lidar com divisão por zero", () => {
    expect(calcPercentDifference(100, 0)).toBe(0);
  });
});
