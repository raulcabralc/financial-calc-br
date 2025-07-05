import FinancingCalc from "../../src/calculators/financing";

describe("FinancingCalc", () => {
  let calc: FinancingCalc;

  beforeEach(() => {
    calc = new FinancingCalc();
  });

  /* ================== */
  /*   financingSAC()   */
  /* ================== */

  describe("financingSAC", () => {
    test("deve calcular SAC corretamente", () => {
      const result = calc.financingSAC(100000, 12, 2);

      expect(result.sistema).toBe("SAC");
      expect(result.valorFinanciado).toBe(100000);
      expect(result.prazo).toBe(24);
      expect(result.taxa).toBe(0.12);

      expect(result.totalJuros).toBeDefined();
      expect(result.totalPago).toBeDefined();
      expect(result.primeiraParcela).toBeDefined();
      expect(result.ultimaParcela).toBeDefined();
      expect(result.resumo.primeiros12).toHaveLength(12);
      expect(result.resumo.ultimos12).toHaveLength(12);
    });

    test("deve rejeitar parâmetros inválidos", () => {
      expect(() => {
        calc.financingSAC(-100000, 12, 2);
      }).toThrow("Parâmetros inválidos");

      expect(() => {
        calc.financingSAC(100000, -12, 2);
      }).toThrow("Parâmetros inválidos");

      expect(() => {
        calc.financingSAC(100000, 12, -2);
      }).toThrow("Parâmetros inválidos");
    });
  });

  /* ==================== */
  /*   financingPrice()   */
  /* ==================== */

  describe("financingPrice", () => {
    test("deve calcular Price corretamente", () => {
      const result = calc.financingPrice(100000, 12, 2);

      expect(result.sistema).toBe("Price");
      expect(result.valorFinanciado).toBe(100000);
      expect(result.prazo).toBe(24);
      expect(result.taxa).toBe(0.12);

      expect(result.totalJuros).toBeDefined();
      expect(result.totalPago).toBeDefined();
      expect(result.prestacaoFixa).toBeDefined();
      expect(result.resumo.primeiros12).toHaveLength(12);
      expect(result.resumo.ultimos12).toHaveLength(12);
    });

    test("deve rejeitar parâmetros inválidos", () => {
      expect(() => {
        calc.financingPrice(-100000, 12, 2);
      }).toThrow("Parâmetros inválidos");
    });
  });

  /* ====================== */
  /*   compareFinancing()   */
  /* ====================== */

  describe("compareFinancing", () => {
    test("deve comparar SAC e Price", () => {
      const result = calc.compareFinancing(100000, 12, 2);

      expect(result.cenario.valor).toBe(100000);
      expect(result.cenario.prazo).toBe("2 anos");
      expect(result.cenario.taxa).toBe("12% ao ano");

      expect(result.sac).toBeDefined();
      expect(result.price).toBeDefined();
      expect(result.comparacao).toBeDefined();

      expect(result.sac.totalJuros).toBeDefined();
      expect(result.price.totalJuros).toBeDefined();
      expect(result.comparacao.economia).toBeDefined();
      expect(result.comparacao.recomendacao).toBeDefined();
    });

    test("deve incluir características de cada sistema", () => {
      const result = calc.compareFinancing(100000, 12, 2);

      expect(result.sac.caracteristicas).toContain("Parcelas decrescentes");
      expect(result.sac.caracteristicas).toContain("Menor custo total");

      expect(result.price.caracteristicas).toContain("Parcelas fixas");
      expect(result.price.caracteristicas).toContain("Fácil planejamento");
    });
  });

  /* ========================= */
  /*   simulateDownPayment()   */
  /* ========================= */

  describe("simulateDownPayment", () => {
    test("deve simular entrada corretamente", () => {
      const result = calc.simulateDownPayment(200000, 50000, 12, 2);

      expect(result.entrada).toBe(50000);
      expect(result.entradaPercentual).toBe(0.25);
      expect(result.valorFinanciado).toBe(150000);

      expect(result.sac.primeira).toBeDefined();
      expect(result.sac.ultima).toBeDefined();
      expect(result.sac.totalJuros).toBeDefined();

      expect(result.price.parcela).toBeDefined();
      expect(result.price.totalJuros).toBeDefined();
    });

    test("deve calcular percentual de entrada corretamente", () => {
      const result = calc.simulateDownPayment(100000, 30000, 12, 2);
      expect(result.entradaPercentual).toBe(0.3);
    });

    test("deve simular sem entrada", () => {
      const result = calc.simulateDownPayment(100000, 0, 12, 2);
      expect(result.entradaPercentual).toBe(0);
      expect(result.valorFinanciado).toBe(100000);
    });
  });

  describe("getRecommendation", () => {
    test("deve recomendar Price quando economia é pequena", () => {
      const recommendation = calc.getRecommendation(1000, 1040, 5000, 4800);
      expect(recommendation.sistema).toBe("Price");
      expect(recommendation.motivo).toContain("Diferença de custo pequena");
    });

    test("deve recomendar SAC quando economia é significativa", () => {
      const recommendation = calc.getRecommendation(1000, 1200, 5000, 4800);
      expect(recommendation.sistema).toBe("SAC");
      expect(recommendation.motivo).toContain("Economia significativa");
    });
  });
});
