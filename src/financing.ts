import {
  formatMoney,
  parseMoney,
  convertRate,
  formatPeriod,
  validateFinancialParams,
} from "./utils";

/* ============== */
/*   INTERFACES   */
/* ============== */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ParcelaDetalhes {
  parcela: number;
  prestacao: string;
  juros: string;
  saldo: string;
}

interface ParcelaDetalhesPRICE extends ParcelaDetalhes {
  amortizacao: string;
}

interface ResumoSAC {
  primeiros12: ParcelaDetalhes[];
  ultimos12: ParcelaDetalhes[];
}

interface ResumoPRICE {
  primeiros12: ParcelaDetalhesPRICE[];
  ultimos12: ParcelaDetalhesPRICE[];
}

interface ResultadoSAC {
  sistema: "SAC";
  valorFinanciado: string;
  prazo: string;
  taxa: string;
  totalJuros: string;
  totalPago: string;
  primeiraParcela: string;
  ultimaParcela: string;
  resumo: ResumoSAC;
}

interface ResultadoPRICE {
  sistema: "Price";
  valorFinanciado: string;
  prazo: string;
  taxa: string;
  totalJuros: string;
  totalPago: string;
  prestacaoFixa: string;
  resumo: ResumoPRICE;
}

interface Cenario {
  valor: string;
  prazo: string;
  taxa: string;
}

interface SistemaComparacao {
  totalJuros: string;
  caracteristicas: string[];
}

interface SACComparacao extends SistemaComparacao {
  primeira: string;
  ultima: string;
}

interface PRICEComparacao extends SistemaComparacao {
  parcelaFixa: string;
}

interface Recomendacao {
  sistema: "SAC" | "Price";
  motivo: string;
}

interface Comparacao {
  economia: string;
  economiaPercentual: string;
  recomendacao: Recomendacao;
}

interface ResultadoComparacao {
  cenario: Cenario;
  sac: SACComparacao;
  price: PRICEComparacao;
  comparacao: Comparacao;
}

interface SimulacaoEntrada {
  entrada: string;
  entradaPercentual: string;
  valorFinanciado: string;
  sac: {
    primeira: string;
    ultima: string;
    totalJuros: string;
  };
  price: {
    parcela: string;
    totalJuros: string;
  };
}

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
        motivo: `Economia significativa de ${formatMoney(
          priceJuros - sacJuros
        )}`,
      };
    }
  }

  /* =================================== */
  /*    SIMULAÇÃO DE UM FINANCIAMENTO    */
  /* =================================== */

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

export default FinancingCalc;
