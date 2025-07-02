const {
  formatMoney,
  parseMoney,
  convertRate,
  formatPeriod,
} = require("./utils");

class FinancingCalc {
  /* ========================== */
  /*   CÁLCULOS (SAC E PRICE)   */
  /* ========================== */

  financingSAC(valor, taxaAnual, anos) {
    const parcelas = anos * 12;
    const taxaMensal = convertRate(taxaAnual, "anual", "mensal");
    const amortizacao = valor / parcelas;

    let saldoDevedor = valor;
    let totalJuros = 0;
    const primeiros12 = [];
    const ultimos12 = [];

    for (let i = 1; i <= parcelas; i++) {
      const juros = saldoDevedor * (taxaMensal / 100);
      const prestacao = amortizacao + juros;
      saldoDevedor = Math.max(0, saldoDevedor - amortizacao);
      totalJuros += juros;

      if (i <= 12) {
        primeiros12.push({
          parcela: i,
          prestacao: formatMoney(prestacao),
          juros: formatMoney(juros),
          saldo: formatMoney(saldoDevedor),
        });
      }
      if (i > parcelas - 12) {
        ultimos12.push({
          parcela: i,
          prestacao: formatMoney(prestacao),
          juros: formatMoney(juros),
          saldo: formatMoney(saldoDevedor),
        });
      }
    }

    return {
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
      resumo: {
        primeiros12,
        ultimos12,
      },
    };
  }

  financingPrice(valor, taxaAnual, anos) {
    const parcelas = anos * 12;
    const taxaMensal = convertRate(taxaAnual, "anual", "mensal") / 100;

    const prestacao =
      (valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas))) /
      (Math.pow(1 + taxaMensal, parcelas) - 1);

    let saldoDevedor = valor;
    let totalJuros = 0;
    const primeiros12 = [];
    const ultimos12 = [];

    for (let i = 1; i <= parcelas; i++) {
      const juros = saldoDevedor * taxaMensal;
      const amortizacao = prestacao - juros;
      saldoDevedor = Math.max(0, saldoDevedor - amortizacao);
      totalJuros += juros;

      if (i <= 12) {
        primeiros12.push({
          parcela: i,
          prestacao: formatMoney(prestacao),
          juros: formatMoney(juros),
          amortizacao: formatMoney(amortizacao),
          saldo: formatMoney(saldoDevedor),
        });
      }
      if (i > parcelas - 12) {
        ultimos12.push({
          parcela: i,
          prestacao: formatMoney(prestacao),
          juros: formatMoney(juros),
          amortizacao: formatMoney(amortizacao),
          saldo: formatMoney(saldoDevedor),
        });
      }
    }

    return {
      sistema: "Price",
      valorFinanciado: formatMoney(valor),
      prazo: `${formatPeriod(parcelas)} (${parcelas}x)`,
      taxa: `${taxaAnual}% a.a.`,
      totalJuros: formatMoney(totalJuros),
      totalPago: formatMoney(valor + totalJuros),
      prestacaoFixa: formatMoney(prestacao),
      resumo: {
        primeiros12,
        ultimos12,
      },
    };
  }

  /* ============================== */
  /*     COMPARA OS DOIS MÉTODOS    */
  /* ============================== */

  compareFinancing(valor, taxaAnual, anos) {
    const sac = this.financingSAC(valor, taxaAnual, anos);
    const price = this.financingPrice(valor, taxaAnual, anos);

    const sacJuros = parseMoney(sac.totalJuros);
    const priceJuros = parseMoney(price.totalJuros);
    const economia = priceJuros - sacJuros;

    return {
      cenario: {
        valor: formatMoney(valor),
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
        economia: formatMoney(economia),
        economiaPercentual: `${((economia / priceJuros) * 100).toFixed(1)}%`,
        recomendacao: this.getRecommendation(
          sacJuros,
          priceJuros,
          parseMoney(sac.primeiraParcela),
          parseMoney(price.prestacaoFixa)
        ),
      },
    };
  }

  /* ===================================== */
  /*    RETORNA O MÉTODO MAIS ECONÔMICO    */
  /* ===================================== */

  getRecommendation(sacJuros, priceJuros, primeiraSAC, parcelaPrice) {
    const economiaPercentual = ((priceJuros - sacJuros) / priceJuros) * 100;
    const diferencaParcela =
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
        motivo: `Economia significativa de ${formatMoney(
          priceJuros - sacJuros
        )}`,
      };
    }
  }

  /* =================================== */
  /*    SIMULAÇÃO DE UM FINANCIAMENTO    */
  /* =================================== */

  simulateDownPayment(valorImovel, entrada, taxaAnual, anos) {
    const valorFinanciado = valorImovel - entrada;
    const result = this.compareFinancing(valorFinanciado, taxaAnual, anos);

    return {
      entrada: formatMoney(entrada),
      entradaPercentual: `${((entrada / valorImovel) * 100).toFixed(0)}%`,
      valorFinanciado: formatMoney(valorFinanciado),
      sac: {
        primeira: result.sac.primeira,
        ultima: result.sac.ultima,
        totalJuros: result.sac.totalJuros,
      },
      price: {
        parcela: result.price.parcelaFixa,
        totalJuros: result.price.totalJuros,
      },
    };
  }
}

module.exports = FinancingCalc;
