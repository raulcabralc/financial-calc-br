import {
  parseMoney,
  convertRate,
  calcIRRate,
  validateFinancialParams,
  formatPeriod,
} from "../utils/utils";

import {
  ValidationResultInvestment,
  ResultadoCDB,
  ResultadoTesouroSelic,
  ResultadoPoupanca,
  OpcaoInvestimento,
  SimulacaoAportes,
  EvolucaoMensal,
  ResultadoComparacaoInvestment,
} from "../types/types";

import RatesManager from "../services/rates";

class InvestmentCalc {
  private rates: RatesManager;

  constructor() {
    this.rates = new RatesManager();
  }

  /* ============== */
  /*    POUPANÇA    */
  /* ============== */

  investmentPoupanca(valor: number, meses: number): ResultadoPoupanca {
    const validation: ValidationResultInvestment = validateFinancialParams(
      valor,
      this.rates.getPoupanca(),
      meses
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaMensal: number = this.rates.getPoupanca() / 100;
    const montante: number = valor * Math.pow(1 + taxaMensal, meses);
    const rendimento: number = montante - valor;

    return {
      investimento: "Poupança",
      valorInicial: valor,
      periodo: formatPeriod(meses),
      taxaMensal: `${this.rates.getPoupanca().toFixed(2)}%`,
      montanteFinal: montante,
      rendimento: rendimento,
      rentabilidade: `${((rendimento / valor) * 100).toFixed(2)}%`,
      isento: true,
      observacao: "Isento de Imposto de Renda e IOF",
    };
  }

  /* =================== */
  /*    TESOURO SELIC    */
  /* =================== */

  investmentTesouroSelic(valor: number, meses: number): ResultadoTesouroSelic {
    const validation: ValidationResultInvestment = validateFinancialParams(
      valor,
      this.rates.getSelic(),
      meses
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaMensal: number =
      convertRate(this.rates.getSelic(), "anual", "mensal") / 100;
    const montanteBruto: number = valor * Math.pow(1 + taxaMensal, meses);
    const rendimentoBruto: number = montanteBruto - valor;

    const dias: number = meses * 30;
    const aliquotaIR: number = calcIRRate(dias);
    const ir: number = rendimentoBruto * (aliquotaIR / 100);
    const rendimentoLiquido: number = rendimentoBruto - ir;

    return {
      investimento: "Tesouro Selic",
      valorInicial: valor,
      periodo: formatPeriod(meses),
      taxaAnual: `${this.rates.getSelic()}%`,
      montanteBruto: montanteBruto,
      impostoRenda: ir,
      aliquotaIR: `${aliquotaIR}%`,
      montanteLiquido: valor + rendimentoLiquido,
      rendimentoLiquido: rendimentoLiquido,
      rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
      observacao: `Tributação regressiva: ${aliquotaIR}% de IR após ${Math.floor(
        dias
      )} dias`,
    };
  }

  /* ========= */
  /*    CDB    */
  /* ========= */

  investmentCDB(
    valor: number,
    meses: number,
    percentualCDI: number = 100
  ): ResultadoCDB {
    const validation: ValidationResultInvestment = validateFinancialParams(
      valor,
      percentualCDI,
      meses
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaCDI: number = this.rates.getCDI() * (percentualCDI / 100);
    const taxaMensal: number = convertRate(taxaCDI, "anual", "mensal") / 100;
    const montanteBruto: number = valor * Math.pow(1 + taxaMensal, meses);
    const rendimentoBruto: number = montanteBruto - valor;

    const dias: number = meses * 30;
    const aliquotaIR: number = calcIRRate(dias);
    const ir: number = rendimentoBruto * (aliquotaIR / 100);
    const rendimentoLiquido: number = rendimentoBruto - ir;

    return {
      investimento: `CDB ${percentualCDI}% CDI`,
      valorInicial: valor,
      periodo: formatPeriod(meses),
      taxaAnual: `${taxaCDI.toFixed(2)}%`,
      percentualCDI: `${percentualCDI}%`,
      montanteBruto: montanteBruto,
      impostoRenda: ir,
      aliquotaIR: `${aliquotaIR}%`,
      montanteLiquido: valor + rendimentoLiquido,
      rendimentoLiquido: rendimentoLiquido,
      rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
    };
  }

  /* ============================== */
  /*    COMPARA OS INVESTIMENTOS    */
  /* ============================== */

  compareInvestments(
    valor: number,
    meses: number,
    opcoes: number[] = [100, 110, 120]
  ): ResultadoComparacaoInvestment {
    const poupanca: ResultadoPoupanca = this.investmentPoupanca(valor, meses);
    const selic: ResultadoTesouroSelic = this.investmentTesouroSelic(
      valor,
      meses
    );
    const cdbs: ResultadoCDB[] = opcoes.map((perc) =>
      this.investmentCDB(valor, meses, perc)
    );

    const rendPoupanca: number = parseMoney(poupanca.rendimento);
    const rendSelic: number = parseMoney(selic.rendimentoLiquido);
    const rendCDBs: OpcaoInvestimento[] = cdbs.map((cdb) => ({
      nome: cdb.investimento,
      rendimento: parseMoney(cdb.rendimentoLiquido),
      rentabilidade: cdb.rentabilidade,
    }));

    const todasOpcoes: OpcaoInvestimento[] = [
      {
        nome: "Poupança",
        rendimento: rendPoupanca,
        rentabilidade: poupanca.rentabilidade,
      },
      {
        nome: "Tesouro Selic",
        rendimento: rendSelic,
        rentabilidade: selic.rentabilidade,
      },
      ...rendCDBs,
    ];

    const melhorOpcao: OpcaoInvestimento = todasOpcoes.reduce((melhor, atual) =>
      atual.rendimento > melhor.rendimento ? atual : melhor
    );

    return {
      cenario: {
        valor: valor,
        periodo: formatPeriod(meses),
        dataAnalise: new Date().toLocaleDateString("pt-BR"),
      },
      opcoes: {
        poupanca: {
          rendimento: poupanca.rendimento,
          rentabilidade: poupanca.rentabilidade,
        },
        tesouroSelic: {
          rendimento: selic.rendimentoLiquido,
          rentabilidade: selic.rentabilidade,
        },
        cdbs: cdbs.map((cdb) => ({
          nome: cdb.investimento,
          rendimento: cdb.rendimentoLiquido,
          rentabilidade: cdb.rentabilidade,
        })),
      },
      ranking: todasOpcoes.sort((a, b) => b.rendimento - a.rendimento),
      melhorOpcao: {
        nome: melhorOpcao.nome,
        rendimento: melhorOpcao.rendimento,
        rentabilidade: melhorOpcao.rentabilidade,
        vantagem:
          melhorOpcao.rendimento -
          Math.min(...todasOpcoes.map((option) => option.rendimento)),
      },
      taxasUtilizadas: {
        selic: this.rates.getAllRates().formatted.selic,
        cdi: this.rates.getAllRates().formatted.cdi,
        poupanca: this.rates.getAllRates().formatted.poupanca,
        atualizadoEm: new Date().toLocaleDateString("pt-BR"),
      },
    };
  }

  /* ================================== */
  /*    SIMULAÇÃO DE APORTES MENSAIS    */
  /* ================================== */

  simulateMonthlyContributions(
    valorInicial: number,
    aporteMensal: number,
    meses: number,
    taxaAnual: number,
    temIR: boolean = true
  ): SimulacaoAportes {
    const validation: ValidationResultInvestment = validateFinancialParams(
      valorInicial,
      taxaAnual,
      meses
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaMensal: number = convertRate(taxaAnual, "anual", "mensal") / 100;
    let montante: number = valorInicial;
    let totalAportado: number = valorInicial;
    const evolucao: EvolucaoMensal[] = [];

    for (let mes = 1; mes <= meses; mes++) {
      montante = montante * (1 + taxaMensal);

      if (mes <= meses) {
        montante += aporteMensal;
        totalAportado += aporteMensal;
      }

      if (mes <= 12 || mes % 12 === 0 || mes === meses) {
        evolucao.push({
          mes: mes,
          montante: montante,
          totalAportado: totalAportado,
          rendimento: montante - totalAportado,
        });
      }
    }

    const rendimentoBruto: number = montante - totalAportado;
    let rendimentoLiquido: number = rendimentoBruto;
    let ir: number = 0;

    if (temIR) {
      const aliquotaIR: number = calcIRRate(meses * 30);
      ir = rendimentoBruto * (aliquotaIR / 100);
      rendimentoLiquido -= ir;
    }

    return {
      simulacao: "Aportes Mensais",
      valorInicial: valorInicial,
      aporteMensal: aporteMensal,
      periodo: formatPeriod(meses),
      taxaAnual: `${taxaAnual}%`,
      totalAportado: totalAportado,
      montanteBruto: montante,
      rendimentoBruto: rendimentoBruto,
      impostoRenda: temIR ? ir : "Isento",
      montanteLiquido: montante - (temIR ? ir : 0),
      rendimentoLiquido: rendimentoLiquido,
      rentabilidadeTotal: `${(
        (rendimentoLiquido / totalAportado) *
        100
      ).toFixed(2)}%`,
      evolucao: evolucao,
    };
  }
}

export default InvestmentCalc;
