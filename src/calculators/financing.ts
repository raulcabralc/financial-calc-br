import {
  parseMoney,
  convertRate,
  formatPeriod,
  validateFinancialParams,
  formatMoney,
} from "../utils/utils";

import {
  ValidationResult,
  ParcelaDetalhes,
  ParcelaDetalhesPRICE,
  ResultadoSAC,
  ResultadoPRICE,
  Recomendacao,
  ResultadoComparacao,
  SimulacaoEntrada,
} from "../types/types";

class FinancingCalc {
  /**
   * Calcula financiamento usando o Sistema de Amortização Constante (SAC)
   * @param {number} valor - Valor total a ser financiado
   * @param {number} taxaAnual - Taxa de juros anual (em percentual)
   * @param {number} anos - Prazo do financiamento em anos
   * @returns {ResultadoSAC} Objeto com detalhes completos do financiamento SAC
   */
  financingSAC(valor: number, taxaAnual: number, anos: number): ResultadoSAC {
    const validation: ValidationResult = validateFinancialParams(
      valor,
      taxaAnual,
      anos
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const parcelas: number = anos * 12;
    const taxaMensal: number = convertRate(taxaAnual, "anual", "mensal") / 100;
    const amortizacao: number = valor / parcelas;

    let saldoDevedor: number = valor;
    let totalJuros: number = 0;
    const primeiros12: ParcelaDetalhes[] = [];
    const ultimos12: ParcelaDetalhes[] = [];

    for (let i = 1; i <= parcelas; i++) {
      const juros: number = saldoDevedor * taxaMensal;
      const prestacao: number = amortizacao + juros;
      saldoDevedor = Math.max(0, saldoDevedor - amortizacao);
      totalJuros += juros;

      if (i <= 12) {
        primeiros12.push({
          parcela: i,
          prestacao: prestacao,
          juros: juros,
          saldo: saldoDevedor,
        });
      }
      if (i > parcelas - 12) {
        ultimos12.push({
          parcela: i,
          prestacao: prestacao,
          juros: juros,
          saldo: saldoDevedor,
        });
      }
    }

    return {
      sistema: "SAC",
      valorFinanciado: valor,
      prazo: parcelas,
      taxa: taxaAnual / 100,
      totalJuros: totalJuros,
      totalPago: valor + totalJuros,
      primeiraParcela: amortizacao + valor * taxaMensal,
      ultimaParcela: amortizacao + amortizacao * taxaMensal,
      resumo: {
        primeiros12,
        ultimos12,
      },
      formatted: {
        sistema: "SAC",
        valorFinanciado: formatMoney(valor),
        prazo: `${formatPeriod(parcelas)} (${parcelas}x)`,
        taxa: `${taxaAnual}% a.a.`,
        totalJuros: formatMoney(totalJuros),
        totalPago: formatMoney(valor + totalJuros),
        primeiraParcela: formatMoney(amortizacao + valor * taxaMensal),
        ultimaParcela: formatMoney(amortizacao + amortizacao * taxaMensal),
      },
    };
  }

  /**
   * Calcula financiamento usando o Sistema Price (Tabela Price)
   * @param {number} valor - Valor total a ser financiado
   * @param {number} taxaAnual - Taxa de juros anual (em percentual)
   * @param {number} anos - Prazo do financiamento em anos
   * @returns {ResultadoPRICE} Objeto com detalhes completos do financiamento Price
   */
  financingPrice(
    valor: number,
    taxaAnual: number,
    anos: number
  ): ResultadoPRICE {
    const validation: ValidationResult = validateFinancialParams(
      valor,
      taxaAnual,
      anos
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const parcelas: number = anos * 12;
    const taxaMensal: number = convertRate(taxaAnual, "anual", "mensal") / 100;

    const prestacao: number =
      (valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas))) /
      (Math.pow(1 + taxaMensal, parcelas) - 1);

    let saldoDevedor: number = valor;
    let totalJuros: number = 0;
    const primeiros12: ParcelaDetalhesPRICE[] = [];
    const ultimos12: ParcelaDetalhesPRICE[] = [];

    for (let i = 1; i <= parcelas; i++) {
      const juros: number = saldoDevedor * taxaMensal;
      const amortizacao: number = prestacao - juros;
      saldoDevedor = Math.max(0, saldoDevedor - amortizacao);
      totalJuros += juros;

      if (i <= 12) {
        primeiros12.push({
          parcela: i,
          prestacao: prestacao,
          juros: juros,
          amortizacao: amortizacao,
          saldo: saldoDevedor,
        });
      }
      if (i > parcelas - 12) {
        ultimos12.push({
          parcela: i,
          prestacao: prestacao,
          juros: juros,
          amortizacao: amortizacao,
          saldo: saldoDevedor,
        });
      }
    }

    return {
      sistema: "Price",
      valorFinanciado: valor,
      prazo: parcelas,
      taxa: taxaAnual / 100,
      totalJuros: totalJuros,
      totalPago: valor + totalJuros,
      prestacaoFixa: prestacao,
      resumo: {
        primeiros12,
        ultimos12,
      },
      formatted: {
        sistema: "Price",
        valorFinanciado: formatMoney(valor),
        prazo: `${formatPeriod(parcelas)} (${parcelas}x)`,
        taxa: `${taxaAnual}% a.a.`,
        totalJuros: formatMoney(totalJuros),
        totalPago: formatMoney(valor + totalJuros),
        prestacaoFixa: formatMoney(prestacao),
      },
    };
  }

  /**
   * Compara os sistemas de financiamento SAC e Price
   * @param {number} valor - Valor total a ser financiado
   * @param {number} taxaAnual - Taxa de juros anual (em percentual)
   * @param {number} anos - Prazo do financiamento em anos
   * @returns {ResultadoComparacao} Objeto com comparação detalhada entre SAC e Price
   */
  compareFinancing(
    valor: number,
    taxaAnual: number,
    anos: number
  ): ResultadoComparacao {
    const validation: ValidationResult = validateFinancialParams(
      valor,
      taxaAnual,
      anos
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const sac: ResultadoSAC = this.financingSAC(valor, taxaAnual, anos);
    const price: ResultadoPRICE = this.financingPrice(valor, taxaAnual, anos);

    const sacJuros: number = sac.totalJuros;
    const priceJuros: number = price.totalJuros;
    const economia: number = priceJuros - sacJuros;

    return {
      cenario: {
        valor: valor,
        prazo: `${anos} anos`,
        taxa: `${taxaAnual}% ao ano`,
      },
      sac: {
        totalJuros: sac.totalJuros,
        primeira: sac.primeiraParcela,
        ultima: sac.ultimaParcela,
        caracteristicas: [
          "Parcelas decrescentes",
          "Menor custo total",
          "Maior parcela inicial",
        ],
      },
      price: {
        totalJuros: price.totalJuros,
        parcelaFixa: price.prestacaoFixa,
        caracteristicas: [
          "Parcelas fixas",
          "Fácil planejamento",
          "Maior custo total",
        ],
      },
      comparacao: {
        economia: economia,
        economiaPercentual: economia / priceJuros,
        recomendacao: this.getRecommendation(
          sacJuros,
          priceJuros,
          sac.primeiraParcela,
          price.prestacaoFixa
        ),
        formatted: {
          economia: formatMoney(economia),
          economiaPercentual: `${((economia / priceJuros) * 100).toFixed(1)}%`,
        },
      },
    };
  }

  /**
   * Determina qual sistema de financiamento é mais recomendado
   * @param {number} sacJuros - Total de juros do sistema SAC
   * @param {number} priceJuros - Total de juros do sistema Price
   * @param {number} primeiraSAC - Valor da primeira parcela SAC
   * @param {number} parcelaPrice - Valor da parcela fixa Price
   * @returns {Recomendacao} Objeto com recomendação do melhor sistema
   */
  getRecommendation(
    sacJuros: number,
    priceJuros: number,
    primeiraSAC: number,
    parcelaPrice: number
  ): Recomendacao {
    const economiaPercentual: number =
      ((priceJuros - sacJuros) / priceJuros) * 100;
    const diferencaParcela: number =
      ((primeiraSAC - parcelaPrice) / parcelaPrice) * 100;

    if (economiaPercentual < 5) {
      return {
        sistema: "Price",
        motivo:
          "Diferença de custo pequena, parcelas fixas facilitam planejamento",
      };
    } else if (diferencaParcela > 30) {
      return {
        sistema: "Price",
        motivo: "Primeira parcela SAC muito alta, pode comprometer orçamento",
      };
    } else {
      return {
        sistema: "SAC",
        motivo: `Economia significativa de ${formatMoney(
          priceJuros - sacJuros
        )}`,
      };
    }
  }

  /**
   * Simula um financiamento com entrada (down payment)
   * @param {number} valorImovel - Valor total do imóvel
   * @param {number} entrada - Valor da entrada
   * @param {number} taxaAnual - Taxa de juros anual (em percentual)
   * @param {number} anos - Prazo do financiamento em anos
   * @returns {SimulacaoEntrada} Objeto com simulação completa incluindo entrada
   */
  simulateDownPayment(
    valorImovel: number,
    entrada: number,
    taxaAnual: number,
    anos: number
  ): SimulacaoEntrada {
    if (valorImovel <= 0) {
      throw new Error("Valor do imóvel deve ser positivo");
    }
    if (entrada < 0) {
      throw new Error("Entrada não pode ser negativa");
    }
    if (entrada >= valorImovel) {
      throw new Error("Entrada não pode ser maior ou igual ao valor do imóvel");
    }

    const validation: ValidationResult = validateFinancialParams(
      valorImovel - entrada,
      taxaAnual,
      anos
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const valorFinanciado: number = valorImovel - entrada;
    const result: ResultadoComparacao = this.compareFinancing(
      valorFinanciado,
      taxaAnual,
      anos
    );

    return {
      entrada: entrada,
      entradaPercentual: entrada / valorImovel,
      valorFinanciado: valorFinanciado,
      sac: {
        primeira: result.sac.primeira,
        ultima: result.sac.ultima,
        totalJuros: result.sac.totalJuros,
      },
      price: {
        parcela: result.price.parcelaFixa,
        totalJuros: result.price.totalJuros,
      },
      formatted: {
        entrada: formatMoney(entrada),
        entradaPercentual: `${((entrada / valorImovel) * 100).toFixed(0)}%`,
        valorFinanciado: formatMoney(valorFinanciado),
        sac: {
          primeira: formatMoney(result.sac.primeira),
          ultima: formatMoney(result.sac.ultima),
          totalJuros: formatMoney(result.sac.totalJuros),
        },
        price: {
          parcela: formatMoney(result.price.parcelaFixa),
          totalJuros: formatMoney(result.price.totalJuros),
        },
      },
    };
  }
}

export default FinancingCalc;
