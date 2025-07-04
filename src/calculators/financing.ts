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
  /* ========================== */
  /*   CÁLCULOS (SAC E PRICE)   */
  /* ========================== */

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
    const taxaMensal: number = convertRate(taxaAnual, "anual", "mensal");
    const amortizacao: number = valor / parcelas;

    let saldoDevedor: number = valor;
    let totalJuros: number = 0;
    const primeiros12: ParcelaDetalhes[] = [];
    const ultimos12: ParcelaDetalhes[] = [];

    for (let i = 1; i <= parcelas; i++) {
      const juros: number = saldoDevedor * (taxaMensal / 100);
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
      primeiraParcela: amortizacao + (valor * taxaMensal) / 100,
      ultimaParcela: amortizacao + (amortizacao * taxaMensal) / 100,
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
        primeiraParcela: formatMoney(amortizacao + (valor * taxaMensal) / 100),
        ultimaParcela: formatMoney(
          amortizacao + (amortizacao * taxaMensal) / 100
        ),
      },
    };
  }

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

  /* ============================== */
  /*     COMPARA OS DOIS MÉTODOS    */
  /* ============================== */

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

    const sacJuros: number = parseMoney(sac.totalJuros);
    const priceJuros: number = parseMoney(price.totalJuros);
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
          parseMoney(sac.primeiraParcela),
          parseMoney(price.prestacaoFixa)
        ),
        formatted: {
          economia: formatMoney(economia),
          economiaPercentual: `${((economia / priceJuros) * 100).toFixed(1)}%`,
        },
      },
    };
  }

  /* ===================================== */
  /*    RETORNA O MÉTODO MAIS ECONÔMICO    */
  /* ===================================== */

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
        motivo: "Primera parcela SAC muito alta, pode comprometer orçamento",
      };
    } else {
      return {
        sistema: "SAC",
        motivo: `Economia significativa de ${priceJuros - sacJuros}`,
      };
    }
  }

  /* =============================================== */
  /*    SIMULAÇÃO DE UM FINANCIAMENTO COM ENTRADA    */
  /* =============================================== */

  simulateDownPayment(
    valorImovel: number,
    entrada: number,
    taxaAnual: number,
    anos: number
  ): SimulacaoEntrada {
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
