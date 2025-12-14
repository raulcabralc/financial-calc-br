import {
  parseMoney,
  convertRate,
  calcIRRate,
  validateFinancialParams,
  formatPeriod,
  formatMoney,
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

  /**
   * Calcula rendimento da poupança
   * @param {number} valor - Valor inicial do investimento
   * @param {number} meses - Período de investimento em meses
   * @returns {ResultadoPoupanca} Objeto com detalhes do rendimento da poupança
   */
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
      periodo: meses,
      taxaMensal: this.rates.getPoupanca() / 100,
      montanteFinal: montante,
      rendimento: rendimento,
      rentabilidade: rendimento / valor,
      isento: true,
      observacao: "Isento de Imposto de Renda e IOF",
      formatted: {
        valorInicial: formatMoney(valor),
        periodo: formatPeriod(meses),
        taxaMensal: `${this.rates.getPoupanca().toFixed(2)}%`,
        montanteFinal: formatMoney(montante),
        rendimento: formatMoney(rendimento),
        rentabilidade: `${((rendimento / valor) * 100).toFixed(2)}%`,
      },
    };
  }

  /**
   * Calcula rendimento do Tesouro Selic
   * @param {number} valor - Valor inicial do investimento
   * @param {number} meses - Período de investimento em meses
   * @returns {ResultadoTesouroSelic} Objeto com detalhes do rendimento do Tesouro Selic
   */
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
      periodo: meses,
      taxaAnual: this.rates.getSelic() / 100,
      montanteBruto: montanteBruto,
      impostoRenda: ir,
      aliquotaIR: aliquotaIR / 100,
      montanteLiquido: valor + rendimentoLiquido,
      rendimentoLiquido: rendimentoLiquido,
      rentabilidade: rendimentoLiquido / valor,
      observacao: `Tributação regressiva: ${aliquotaIR}% de IR após ${Math.floor(
        dias
      )} dias`,
      formatted: {
        valorInicial: formatMoney(valor),
        periodo: formatPeriod(meses),
        taxaAnual: `${this.rates.getSelic()}%`,
        montanteBruto: formatMoney(montanteBruto),
        impostoRenda: formatMoney(ir),
        aliquotaIR: `${aliquotaIR}%`,
        montanteLiquido: formatMoney(valor + rendimentoLiquido),
        rendimentoLiquido: formatMoney(rendimentoLiquido),
        rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
      },
    };
  }

  /**
   * Calcula rendimento do CDB (Certificado de Depósito Bancário)
   * @param {number} valor - Valor inicial do investimento
   * @param {number} meses - Período de investimento em meses
   * @param {number} percentualCDI - Percentual do CDI pago pelo CDB (padrão: 100%)
   * @returns {ResultadoCDB} Objeto com detalhes do rendimento do CDB
   */
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
      periodo: meses,
      taxaAnual: taxaCDI / 100,
      percentualCDI: percentualCDI / 100,
      montanteBruto: montanteBruto,
      impostoRenda: ir,
      aliquotaIR: aliquotaIR / 100,
      montanteLiquido: valor + rendimentoLiquido,
      rendimentoLiquido: rendimentoLiquido,
      rentabilidade: rendimentoLiquido / valor,
      formatted: {
        valorInicial: formatMoney(valor),
        periodo: formatPeriod(meses),
        taxaAnual: `${taxaCDI.toFixed(2)}%`,
        percentualCDI: `${percentualCDI}%`,
        montanteBruto: formatMoney(montanteBruto),
        impostoRenda: formatMoney(ir),
        aliquotaIR: `${aliquotaIR}%`,
        montanteLiquido: formatMoney(valor + rendimentoLiquido),
        rendimentoLiquido: formatMoney(rendimentoLiquido),
        rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
      },
    };
  }

  /**
   * Compara diferentes opções de investimento
   * @param {number} valor - Valor inicial do investimento
   * @param {number} meses - Período de investimento em meses
   * @param {number[]} opcoes - Array com percentuais de CDI para comparação (padrão: [100, 110, 120])
   * @returns {ResultadoComparacaoInvestment} Objeto com comparação detalhada entre investimentos
   */
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

    const rendPoupanca: number = poupanca.rendimento;
    const rendSelic: number = selic.rendimentoLiquido;
    const rendCDBs: OpcaoInvestimento[] = cdbs.map((cdb) => ({
      nome: cdb.investimento,
      rendimento: cdb.rendimentoLiquido,
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

  /**
   * Simula investimento com aportes mensais
   * @param {number} valorInicial - Valor inicial do investimento
   * @param {number} aporteMensal - Valor do aporte mensal
   * @param {number} meses - Período total de investimento em meses
   * @param {number} taxaAnual - Taxa de juros anual (em percentual)
   * @param {boolean} temIR - Indica se há incidência de Imposto de Renda (padrão: true)
   * @returns {SimulacaoAportes} Objeto com simulação completa dos aportes mensais
   */
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

      montante += aporteMensal;
      totalAportado += aporteMensal;

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
      periodo: meses,
      taxaAnual: taxaAnual / 100,
      totalAportado: totalAportado,
      montanteBruto: montante,
      rendimentoBruto: rendimentoBruto,
      impostoRenda: temIR ? ir : 0,
      montanteLiquido: montante - (temIR ? ir : 0),
      rendimentoLiquido: rendimentoLiquido,
      rentabilidadeTotal: rendimentoLiquido / totalAportado,
      evolucao: evolucao,
      formatted: {
        valorInicial: formatMoney(valorInicial),
        aporteMensal: formatMoney(aporteMensal),
        periodo: formatPeriod(meses),
        taxaAnual: `${taxaAnual}%`,
        totalAportado: formatMoney(totalAportado),
        montanteBruto: formatMoney(montante),
        rendimentoBruto: formatMoney(rendimentoBruto),
        impostoRenda: temIR ? formatMoney(ir) : formatMoney(0),
        montanteLiquido: formatMoney(montante - (temIR ? ir : 0)),
        rendimentoLiquido: formatMoney(rendimentoLiquido),
        rentabilidadeTotal: `${(
          (rendimentoLiquido / totalAportado) *
          100
        ).toFixed(2)}%`,
      },
    };
  }
}

export default InvestmentCalc;
