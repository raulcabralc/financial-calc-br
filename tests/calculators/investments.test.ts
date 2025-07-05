import InvestmentCalc from "../../src/calculators/investments";

jest.mock("../../src/services/rates", () => {
  return jest.fn().mockImplementation(() => ({
    getSelic: jest.fn(() => 10.75),
    getCDI: jest.fn(() => 10.5),
    getPoupanca: jest.fn(() => 0.5),
    getAllRates: jest.fn(() => ({
      formatted: {
        selic: "10.75% a.a.",
        cdi: "10.50% a.a.",
        poupanca: "0.50% a.m.",
      },
    })),
  }));
});

describe("InvestmentCalc", () => {
  let calc: InvestmentCalc;

  beforeEach(() => {
    calc = new InvestmentCalc();
  });

  /* ========================== */
  /*    investmentPoupanca()    */
  /* ========================== */

  describe("investmentPoupanca", () => {
    test("deve calcular poupança corretamente", () => {
      const result = calc.investmentPoupanca(10000, 12);

      expect(result.investimento).toBe("Poupança");
      expect(result.valorInicial).toBe(10000);
      expect(result.periodo).toBe(12);
      expect(result.taxaMensal).toBe(0.005);
      expect(result.montanteFinal).toBeDefined();
      expect(result.rendimento).toBeDefined();
      expect(result.rentabilidade).toBeDefined();
      expect(result.isento).toBe(true);
      expect(result.observacao).toBe("Isento de Imposto de Renda e IOF");
    });

    test("deve rejeitar parâmetros inválidos", () => {
      expect(() => {
        calc.investmentPoupanca(-10000, 12);
      }).toThrow("Parâmetros inválidos");

      expect(() => {
        calc.investmentPoupanca(10000, -12);
      }).toThrow("Parâmetros inválidos");
    });

    test("deve calcular juros compostos corretamente", () => {
      const valor = 1000;
      const meses = 12;
      const result = calc.investmentPoupanca(valor, meses);

      const taxaMensal = 0.5 / 100;
      const montanteEsperado = valor * Math.pow(1 + taxaMensal, meses);
      const rendimentoEsperado = montanteEsperado - valor;

      expect(result.montanteFinal).toBe(montanteEsperado);
      expect(result.rendimento).toBe(rendimentoEsperado);
    });
  });

  /* ============================== */
  /*    investmentTesouroSelic()    */
  /* ============================== */

  describe("investmentTesouroSelic", () => {
    test("deve calcular Tesouro Selic corretamente", () => {
      const result = calc.investmentTesouroSelic(10000, 12);

      expect(result.investimento).toBe("Tesouro Selic");
      expect(result.valorInicial).toBe(10000);
      expect(result.periodo).toBe(12);
      expect(result.taxaAnual).toBe(0.1075);
      expect(result.montanteBruto).toBeDefined();
      expect(result.impostoRenda).toBeDefined();
      expect(result.aliquotaIR).toBeDefined();
      expect(result.montanteLiquido).toBeDefined();
      expect(result.rendimentoLiquido).toBeDefined();
      expect(result.rentabilidade).toBeDefined();
      expect(result.observacao).toContain("Tributação regressiva");
    });

    test("deve aplicar alíquota de IR correta por prazo", () => {
      const result6m = calc.investmentTesouroSelic(10000, 6);
      expect(result6m.aliquotaIR).toBe(0.225);

      const result12m = calc.investmentTesouroSelic(10000, 12);
      expect(result12m.aliquotaIR).toBe(0.2);

      const result24m = calc.investmentTesouroSelic(10000, 24);
      expect(result24m.aliquotaIR).toBe(0.175);

      const result36m = calc.investmentTesouroSelic(10000, 36);
      expect(result36m.aliquotaIR).toBe(0.15);
    });

    test("deve rejeitar parâmetros inválidos", () => {
      expect(() => {
        calc.investmentTesouroSelic(-10000, 12);
      }).toThrow("Parâmetros inválidos");
    });
  });

  /* ===================== */
  /*    investmentCDB()    */
  /* ===================== */

  describe("investmentCDB", () => {
    test("deve calcular CDB 100% CDI corretamente", () => {
      const result = calc.investmentCDB(10000, 12, 100);

      expect(result.investimento).toBe("CDB 100% CDI");
      expect(result.valorInicial).toBe(10000);
      expect(result.periodo).toBe(12);
      expect(result.percentualCDI).toBe(1);
      expect(result.montanteBruto).toBeDefined();
      expect(result.impostoRenda).toBeDefined();
      expect(result.aliquotaIR).toBeDefined();
      expect(result.montanteLiquido).toBeDefined();
      expect(result.rendimentoLiquido).toBeDefined();
      expect(result.rentabilidade).toBeDefined();
    });

    test("deve calcular CDB 120% CDI corretamente", () => {
      const result = calc.investmentCDB(10000, 12, 120);

      expect(result.investimento).toBe("CDB 120% CDI");
      expect(result.percentualCDI).toBe(1.2);
      expect(result.taxaAnual).toBe(0.126);
    });

    test("deve usar 100% CDI como padrão", () => {
      const result = calc.investmentCDB(10000, 12);

      expect(result.investimento).toBe("CDB 100% CDI");
      expect(result.percentualCDI).toBe(1);
    });

    test("deve rejeitar parâmetros inválidos", () => {
      expect(() => {
        calc.investmentCDB(-10000, 12, 100);
      }).toThrow("Parâmetros inválidos");
    });
  });

  /* ========================== */
  /*    compareInvestments()    */
  /* ========================== */

  describe("compareInvestments", () => {
    test("deve comparar investimentos corretamente", () => {
      const result = calc.compareInvestments(10000, 12);

      expect(result.cenario.valor).toBe(10000);
      expect(result.cenario.periodo).toBe("1 ano");
      expect(result.cenario.dataAnalise).toBeDefined();

      expect(result.opcoes.poupanca).toBeDefined();
      expect(result.opcoes.tesouroSelic).toBeDefined();
      expect(result.opcoes.cdbs).toHaveLength(3);

      expect(result.ranking).toBeDefined();
      expect(result.ranking.length).toBeGreaterThan(0);
      expect(result.melhorOpcao).toBeDefined();
      expect(result.taxasUtilizadas).toBeDefined();
    });

    test("deve usar opções de CDB personalizadas", () => {
      const result = calc.compareInvestments(10000, 12, [90, 105, 130]);

      expect(result.opcoes.cdbs).toHaveLength(3);
      expect(result.opcoes.cdbs[0].nome).toBe("CDB 90% CDI");
      expect(result.opcoes.cdbs[1].nome).toBe("CDB 105% CDI");
      expect(result.opcoes.cdbs[2].nome).toBe("CDB 130% CDI");
    });

    test("deve ordenar ranking por rendimento", () => {
      const result = calc.compareInvestments(10000, 12);

      for (let i = 0; i < result.ranking.length - 1; i++) {
        expect(result.ranking[i].rendimento).toBeGreaterThanOrEqual(
          result.ranking[i + 1].rendimento
        );
      }
    });

    test("deve identificar melhor opção", () => {
      const result = calc.compareInvestments(10000, 12);

      expect(result.melhorOpcao.nome).toBe(result.ranking[0].nome);
      expect(result.melhorOpcao.rendimento).toBeDefined();
      expect(result.melhorOpcao.rentabilidade).toBeDefined();
      expect(result.melhorOpcao.vantagem).toBeDefined();
    });
  });

  /* ==================================== */
  /*    simulateMonthlyContributions()    */
  /* ==================================== */

  describe("simulateMonthlyContributions", () => {
    test("deve simular aportes mensais com IR", () => {
      const result = calc.simulateMonthlyContributions(1000, 500, 12, 10, true);

      expect(result.simulacao).toBe("Aportes Mensais");
      expect(result.valorInicial).toBe(1000);
      expect(result.aporteMensal).toBe(500);
      expect(result.periodo).toBe(12);
      expect(result.taxaAnual).toBe(0.1);
      expect(result.totalAportado).toBeDefined();
      expect(result.montanteBruto).toBeDefined();
      expect(result.rendimentoBruto).toBeDefined();
      expect(result.impostoRenda).not.toBe(0);
      expect(result.montanteLiquido).toBeDefined();
      expect(result.rendimentoLiquido).toBeDefined();
      expect(result.rentabilidadeTotal).toBeDefined();
      expect(result.evolucao).toBeDefined();
    });

    test("deve simular aportes mensais sem IR", () => {
      const result = calc.simulateMonthlyContributions(
        1000,
        500,
        12,
        10,
        false
      );

      expect(result.impostoRenda).toBe(0);
      expect(result.montanteLiquido).toBe(result.montanteBruto);
      expect(result.rendimentoLiquido).toBe(result.rendimentoBruto);
    });

    test("deve gerar evolução mensal", () => {
      const result = calc.simulateMonthlyContributions(1000, 500, 24, 10, true);

      expect(result.evolucao.length).toBeGreaterThan(0);
      expect(result.evolucao[0].mes).toBe(1);
      expect(result.evolucao[result.evolucao.length - 1].mes).toBe(24);

      result.evolucao.forEach((periodo) => {
        expect(periodo).toHaveProperty("mes");
        expect(periodo).toHaveProperty("montante");
        expect(periodo).toHaveProperty("totalAportado");
        expect(periodo).toHaveProperty("rendimento");
      });
    });

    test("deve calcular total aportado corretamente", () => {
      const valorInicial = 1000;
      const aporteMensal = 500;
      const meses = 12;
      const result = calc.simulateMonthlyContributions(
        valorInicial,
        aporteMensal,
        meses,
        10,
        false
      );

      const totalEsperado = valorInicial + aporteMensal * meses;
      expect(result.totalAportado).toBe(totalEsperado);
    });

    test("deve rejeitar parâmetros inválidos", () => {
      expect(() => {
        calc.simulateMonthlyContributions(-1000, 500, 12, 10, true);
      }).toThrow("Parâmetros inválidos");

      expect(() => {
        calc.simulateMonthlyContributions(1000, 500, -12, 10, true);
      }).toThrow("Parâmetros inválidos");
    });
  });

  /* ===================== */
  /*    Casos Especiais    */
  /* ===================== */

  describe("Casos especiais", () => {
    test("deve lidar com período de 1 mês", () => {
      const result = calc.investmentPoupanca(1000, 1);

      expect(result.periodo).toBe(1);
      expect(result.montanteFinal).toBeDefined();
      expect(result.rendimento).toBeDefined();
    });

    test("deve lidar com valores pequenos", () => {
      const result = calc.investmentCDB(100, 6, 100);

      expect(result.valorInicial).toBe(100);
      expect(result.montanteBruto).toBeDefined();
      expect(result.rendimentoLiquido).toBeDefined();
    });

    test("deve lidar com períodos longos", () => {
      const result = calc.investmentTesouroSelic(10000, 60);

      expect(result.periodo).toBe(60);
      expect(result.aliquotaIR).toBe(0.15);
    });
  });
});
