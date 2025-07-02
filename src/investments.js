const {
  formatMoney,
  parseMoney,
  convertRate,
  calcIRRate,
  validateFinancialParams,
  formatPeriod,
} = require("./utils");

class InvestmentCalc {
  constructor(ratesManager) {
    this.rates = ratesManager;
  }

  /* ============== */
  /*    POUPANÇA    */
  /* ============== */

  investmentPoupanca(valor, meses) {
    const validation = validateFinancialParams(
      valor,
      this.rates.getPoupanca(),
      meses
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaMensal = this.rates.getPoupanca() / 100;
    const montante = valor * Math.pow(1 + taxaMensal, meses);
    const rendimento = montante - valor;

    return {
      investimento: "Poupança",
      valorInicial: formatMoney(valor),
      periodo: formatPeriod(meses),
      taxaMensal: `${this.rates.getPoupanca().toFixed(2)}%`,
      montanteFinal: formatMoney(montante),
      rendimento: formatMoney(rendimento),
      rentabilidade: `${((rendimento / valor) * 100).toFixed(2)}%`,
      isento: true,
      observacao: "Isento de Imposto de Renda e IOF",
    };
  }

  /* =================== */
  /*    TESOURO SELIC    */
  /* =================== */

  investmentTesouroSelic(valor, meses) {
    const validation = validateFinancialParams(
      valor,
      this.rates.getSelic(),
      meses
    );
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaMensal =
      convertRate(this.rates.getSelic(), "anual", "mensal") / 100;
    const montanteBruto = valor * Math.pow(1 + taxaMensal, meses);
    const rendimentoBruto = montanteBruto - valor;

    const dias = meses * 30;
    const aliquotaIR = calcIRRate(dias);
    const ir = rendimentoBruto * (aliquotaIR / 100);
    const rendimentoLiquido = rendimentoBruto - ir;

    return {
      investimento: "Tesouro Selic",
      valorInicial: formatMoney(valor),
      periodo: formatPeriod(meses),
      taxaAnual: `${this.rates.getSelic()}%`,
      montanteBruto: formatMoney(montanteBruto),
      impostoRenda: formatMoney(ir),
      aliquotaIR: `${aliquotaIR}%`,
      montanteLiquido: formatMoney(valor + rendimentoLiquido),
      rendimentoLiquido: formatMoney(rendimentoLiquido),
      rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
      observacao: `Tributação regressiva: ${aliquotaIR}% de IR após ${Math.floor(
        dias
      )} dias`,
    };
  }

  /* ========= */
  /*    CDB    */
  /* ========= */

  investmentCDB(valor, meses, percentualCDI = 100) {
    const validation = validateFinancialParams(valor, percentualCDI, meses);
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaCDI = this.rates.getCDI() * (percentualCDI / 100);
    const taxaMensal = convertRate(taxaCDI, "anual", "mensal") / 100;
    const montanteBruto = valor * Math.pow(1 + taxaMensal, meses);
    const rendimentoBruto = montanteBruto - valor;

    const dias = meses * 30;
    const aliquotaIR = calcIRRate(dias);
    const ir = rendimentoBruto * (aliquotaIR / 100);
    const rendimentoLiquido = rendimentoBruto - ir;

    return {
      investimento: `CDB ${percentualCDI}% CDI`,
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
    };
  }

  /* ============================== */
  /*    COMPARA OS INVESTIMENTOS    */
  /* ============================== */

  compareInvestments(valor, meses, opcoes = [100, 110, 120]) {
    const poupanca = this.investmentPoupanca(valor, meses);
    const selic = this.investmentTesouroSelic(valor, meses);
    const cdbs = opcoes.map((perc) => this.investmentCDB(valor, meses, perc));

    const rendPoupanca = parseMoney(poupanca.rendimento);
    const rendSelic = parseMoney(selic.rendimentoLiquido);
    const rendCDBs = cdbs.map((cdb) => ({
      nome: cdb.investimento,
      rendimento: parseMoney(cdb.rendimentoLiquido),
      rentabilidade: cdb.rentabilidade,
    }));

    const todasOpcoes = [
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

    const melhorOpcao = todasOpcoes.reduce((melhor, atual) =>
      atual.rendimento > melhor.rendimento ? atual : melhor
    );

    return {
      cenario: {
        valor: formatMoney(valor),
        periodo: formatPeriod(meses),
        dataAnalise: new Date().toLocaleDateString("pt-BR"),
      },
      opcoes: {
        poupanca: {
          rendimento: poupanca.rendimento,
          rentabilidade: poupanca.rentabilidade,
          caracteristicas: [
            "Isento de IR",
            "Liquidez diária",
            "Garantido pelo FGC",
          ],
        },
        tesouroSelic: {
          rendimento: selic.rendimentoLiquido,
          rentabilidade: selic.rentabilidade,
          caracteristicas: ["Renda fixa", "Liquidez diária", "Baixo risco"],
        },
        cdbs: cdbs.map((cdb) => ({
          nome: cdb.investimento,
          rendimento: cdb.rendimentoLiquido,
          rentabilidade: cdb.rentabilidade,
          caracteristicas: [
            "Garantido pelo FGC até R$ 250.000",
            "Tributação regressiva",
          ],
        })),
      },
      ranking: todasOpcoes.sort((a, b) => b.rendimento - a.rendimento),
      melhorOpcao: {
        nome: melhorOpcao.nome,
        rendimento: formatMoney(melhorOpcao.rendimento),
        rentabilidade: melhorOpcao.rentabilidade,
        vantagem: formatMoney(
          melhorOpcao.rendimento -
            Math.min(...todasOpcoes.map((o) => o.rendimento))
        ),
      },
      taxasUtilizadas: {
        selic: `${this.rates.getSelic()}%`,
        cdi: `${this.rates.getCDI().toFixed(2)}%`,
        poupanca: `${this.rates.getPoupanca().toFixed(2)}%`,
        atualizadoEm: this.rates.getAllRates().formatted.lastUpdate,
      },
    };
  }

  /* ================================== */
  /*    SIMULAÇÃO DE APORTES MENSAIS    */
  /* ================================== */

  simulateMonthlyContributions(
    valorInicial,
    aporteMensal,
    meses,
    taxaAnual,
    temIR = true
  ) {
    const validation = validateFinancialParams(valorInicial, taxaAnual, meses);
    if (!validation.isValid) {
      throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
    }

    const taxaMensal = convertRate(taxaAnual, "anual", "mensal") / 100;
    let montante = valorInicial;
    let totalAportado = valorInicial;
    const evolucao = [];

    for (let mes = 1; mes <= meses; mes++) {
      montante = montante * (1 + taxaMensal);

      if (mes <= meses) {
        montante += aporteMensal;
        totalAportado += aporteMensal;
      }

      if (mes <= 12 || mes % 12 === 0 || mes === meses) {
        evolucao.push({
          mes: mes,
          montante: formatMoney(montante),
          totalAportado: formatMoney(totalAportado),
          rendimento: formatMoney(montante - totalAportado),
        });
      }
    }

    const rendimentoBruto = montante - totalAportado;
    let rendimentoLiquido = rendimentoBruto;
    let ir = 0;

    if (temIR) {
      const aliquotaIR = calcIRRate(meses * 30);
      ir = rendimentoBruto * (aliquotaIR / 100);
      rendimentoLiquido -= ir;
    }

    return {
      simulacao: "Aportes Mensais",
      valorInicial: formatMoney(valorInicial),
      aporteMensal: formatMoney(aporteMensal),
      periodo: formatPeriod(meses),
      taxaAnual: `${taxaAnual}%`,
      totalAportado: formatMoney(totalAportado),
      montanteBruto: formatMoney(montante),
      rendimentoBruto: formatMoney(rendimentoBruto),
      impostoRenda: temIR ? formatMoney(ir) : "Isento",
      montanteLiquido: formatMoney(montante - (temIR ? ir : 0)),
      rendimentoLiquido: formatMoney(rendimentoLiquido),
      rentabilidadeTotal: `${(
        (rendimentoLiquido / totalAportado) *
        100
      ).toFixed(2)}%`,
      evolucao: evolucao,
    };
  }
}

module.exports = InvestmentCalc;
