"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const rates_1 = __importDefault(require("../services/rates"));
class InvestmentCalc {
    constructor() {
        this.rates = new rates_1.default();
    }
    /* ============== */
    /*    POUPANÇA    */
    /* ============== */
    investmentPoupanca(valor, meses) {
        const validation = (0, utils_1.validateFinancialParams)(valor, this.rates.getPoupanca(), meses);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const taxaMensal = this.rates.getPoupanca() / 100;
        const montante = valor * Math.pow(1 + taxaMensal, meses);
        const rendimento = montante - valor;
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
                valorInicial: (0, utils_1.formatMoney)(valor),
                periodo: (0, utils_1.formatPeriod)(meses),
                taxaMensal: `${this.rates.getPoupanca().toFixed(2)}%`,
                montanteFinal: (0, utils_1.formatMoney)(montante),
                rendimento: (0, utils_1.formatMoney)(rendimento),
                rentabilidade: `${((rendimento / valor) * 100).toFixed(2)}%`,
            },
        };
    }
    /* =================== */
    /*    TESOURO SELIC    */
    /* =================== */
    investmentTesouroSelic(valor, meses) {
        const validation = (0, utils_1.validateFinancialParams)(valor, this.rates.getSelic(), meses);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const taxaMensal = (0, utils_1.convertRate)(this.rates.getSelic(), "anual", "mensal") / 100;
        const montanteBruto = valor * Math.pow(1 + taxaMensal, meses);
        const rendimentoBruto = montanteBruto - valor;
        const dias = meses * 30;
        const aliquotaIR = (0, utils_1.calcIRRate)(dias);
        const ir = rendimentoBruto * (aliquotaIR / 100);
        const rendimentoLiquido = rendimentoBruto - ir;
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
            observacao: `Tributação regressiva: ${aliquotaIR}% de IR após ${Math.floor(dias)} dias`,
            formatted: {
                valorInicial: (0, utils_1.formatMoney)(valor),
                periodo: (0, utils_1.formatPeriod)(meses),
                taxaAnual: `${this.rates.getSelic()}%`,
                montanteBruto: (0, utils_1.formatMoney)(montanteBruto),
                impostoRenda: (0, utils_1.formatMoney)(ir),
                aliquotaIR: `${aliquotaIR}%`,
                montanteLiquido: (0, utils_1.formatMoney)(valor + rendimentoLiquido),
                rendimentoLiquido: (0, utils_1.formatMoney)(rendimentoLiquido),
                rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
            },
        };
    }
    /* ========= */
    /*    CDB    */
    /* ========= */
    investmentCDB(valor, meses, percentualCDI = 100) {
        const validation = (0, utils_1.validateFinancialParams)(valor, percentualCDI, meses);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const taxaCDI = this.rates.getCDI() * (percentualCDI / 100);
        const taxaMensal = (0, utils_1.convertRate)(taxaCDI, "anual", "mensal") / 100;
        const montanteBruto = valor * Math.pow(1 + taxaMensal, meses);
        const rendimentoBruto = montanteBruto - valor;
        const dias = meses * 30;
        const aliquotaIR = (0, utils_1.calcIRRate)(dias);
        const ir = rendimentoBruto * (aliquotaIR / 100);
        const rendimentoLiquido = rendimentoBruto - ir;
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
                valorInicial: (0, utils_1.formatMoney)(valor),
                periodo: (0, utils_1.formatPeriod)(meses),
                taxaAnual: `${taxaCDI.toFixed(2)}%`,
                percentualCDI: `${percentualCDI}%`,
                montanteBruto: (0, utils_1.formatMoney)(montanteBruto),
                impostoRenda: (0, utils_1.formatMoney)(ir),
                aliquotaIR: `${aliquotaIR}%`,
                montanteLiquido: (0, utils_1.formatMoney)(valor + rendimentoLiquido),
                rendimentoLiquido: (0, utils_1.formatMoney)(rendimentoLiquido),
                rentabilidade: `${((rendimentoLiquido / valor) * 100).toFixed(2)}%`,
            },
        };
    }
    /* ============================== */
    /*    COMPARA OS INVESTIMENTOS    */
    /* ============================== */
    compareInvestments(valor, meses, opcoes = [100, 110, 120]) {
        const poupanca = this.investmentPoupanca(valor, meses);
        const selic = this.investmentTesouroSelic(valor, meses);
        const cdbs = opcoes.map((perc) => this.investmentCDB(valor, meses, perc));
        const rendPoupanca = (0, utils_1.parseMoney)(poupanca.rendimento);
        const rendSelic = (0, utils_1.parseMoney)(selic.rendimentoLiquido);
        const rendCDBs = cdbs.map((cdb) => ({
            nome: cdb.investimento,
            rendimento: (0, utils_1.parseMoney)(cdb.rendimentoLiquido),
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
        const melhorOpcao = todasOpcoes.reduce((melhor, atual) => atual.rendimento > melhor.rendimento ? atual : melhor);
        return {
            cenario: {
                valor: valor,
                periodo: (0, utils_1.formatPeriod)(meses),
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
                vantagem: melhorOpcao.rendimento -
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
    simulateMonthlyContributions(valorInicial, aporteMensal, meses, taxaAnual, temIR = true) {
        const validation = (0, utils_1.validateFinancialParams)(valorInicial, taxaAnual, meses);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const taxaMensal = (0, utils_1.convertRate)(taxaAnual, "anual", "mensal") / 100;
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
                    montante: montante,
                    totalAportado: totalAportado,
                    rendimento: montante - totalAportado,
                });
            }
        }
        const rendimentoBruto = montante - totalAportado;
        let rendimentoLiquido = rendimentoBruto;
        let ir = 0;
        if (temIR) {
            const aliquotaIR = (0, utils_1.calcIRRate)(meses * 30);
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
                valorInicial: (0, utils_1.formatMoney)(valorInicial),
                aporteMensal: (0, utils_1.formatMoney)(aporteMensal),
                periodo: (0, utils_1.formatPeriod)(meses),
                taxaAnual: `${taxaAnual}%`,
                totalAportado: (0, utils_1.formatMoney)(totalAportado),
                montanteBruto: (0, utils_1.formatMoney)(montante),
                rendimentoBruto: (0, utils_1.formatMoney)(rendimentoBruto),
                impostoRenda: temIR ? (0, utils_1.formatMoney)(ir) : (0, utils_1.formatMoney)(0),
                montanteLiquido: (0, utils_1.formatMoney)(montante - (temIR ? ir : 0)),
                rendimentoLiquido: (0, utils_1.formatMoney)(rendimentoLiquido),
                rentabilidadeTotal: (0, utils_1.formatMoney)(rendimentoLiquido / totalAportado),
            },
        };
    }
}
exports.default = InvestmentCalc;
