"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
class FinancingCalc {
    /* ========================== */
    /*   CÁLCULOS (SAC E PRICE)   */
    /* ========================== */
    financingSAC(valor, taxaAnual, anos) {
        const validation = (0, utils_1.validateFinancialParams)(valor, taxaAnual, anos);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const parcelas = anos * 12;
        const taxaMensal = (0, utils_1.convertRate)(taxaAnual, "anual", "mensal");
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
                valorFinanciado: (0, utils_1.formatMoney)(valor),
                prazo: `${(0, utils_1.formatPeriod)(parcelas)} (${parcelas}x)`,
                taxa: `${taxaAnual}% a.a.`,
                totalJuros: (0, utils_1.formatMoney)(totalJuros),
                totalPago: (0, utils_1.formatMoney)(valor + totalJuros),
                primeiraParcela: (0, utils_1.formatMoney)(amortizacao + (valor * taxaMensal) / 100),
                ultimaParcela: (0, utils_1.formatMoney)(amortizacao + (amortizacao * taxaMensal) / 100),
            },
        };
    }
    financingPrice(valor, taxaAnual, anos) {
        const validation = (0, utils_1.validateFinancialParams)(valor, taxaAnual, anos);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const parcelas = anos * 12;
        const taxaMensal = (0, utils_1.convertRate)(taxaAnual, "anual", "mensal") / 100;
        const prestacao = (valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas))) /
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
                valorFinanciado: (0, utils_1.formatMoney)(valor),
                prazo: `${(0, utils_1.formatPeriod)(parcelas)} (${parcelas}x)`,
                taxa: `${taxaAnual}% a.a.`,
                totalJuros: (0, utils_1.formatMoney)(totalJuros),
                totalPago: (0, utils_1.formatMoney)(valor + totalJuros),
                prestacaoFixa: (0, utils_1.formatMoney)(prestacao),
            },
        };
    }
    /* ============================== */
    /*     COMPARA OS DOIS MÉTODOS    */
    /* ============================== */
    compareFinancing(valor, taxaAnual, anos) {
        const validation = (0, utils_1.validateFinancialParams)(valor, taxaAnual, anos);
        if (!validation.isValid) {
            throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
        }
        const sac = this.financingSAC(valor, taxaAnual, anos);
        const price = this.financingPrice(valor, taxaAnual, anos);
        const sacJuros = (0, utils_1.parseMoney)(sac.totalJuros);
        const priceJuros = (0, utils_1.parseMoney)(price.totalJuros);
        const economia = priceJuros - sacJuros;
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
                recomendacao: this.getRecommendation(sacJuros, priceJuros, (0, utils_1.parseMoney)(sac.primeiraParcela), (0, utils_1.parseMoney)(price.prestacaoFixa)),
                formatted: {
                    economia: (0, utils_1.formatMoney)(economia),
                    economiaPercentual: `${((economia / priceJuros) * 100).toFixed(1)}%`,
                },
            },
        };
    }
    /* ===================================== */
    /*    RETORNA O MÉTODO MAIS ECONÔMICO    */
    /* ===================================== */
    getRecommendation(sacJuros, priceJuros, primeiraSAC, parcelaPrice) {
        const economiaPercentual = ((priceJuros - sacJuros) / priceJuros) * 100;
        const diferencaParcela = ((primeiraSAC - parcelaPrice) / parcelaPrice) * 100;
        if (economiaPercentual < 5) {
            return {
                sistema: "Price",
                motivo: "Diferença de custo pequena, parcelas fixas facilitam planejamento",
            };
        }
        else if (diferencaParcela > 30) {
            return {
                sistema: "Price",
                motivo: "Primera parcela SAC muito alta, pode comprometer orçamento",
            };
        }
        else {
            return {
                sistema: "SAC",
                motivo: `Economia significativa de ${priceJuros - sacJuros}`,
            };
        }
    }
    /* =============================================== */
    /*    SIMULAÇÃO DE UM FINANCIAMENTO COM ENTRADA    */
    /* =============================================== */
    simulateDownPayment(valorImovel, entrada, taxaAnual, anos) {
        const valorFinanciado = valorImovel - entrada;
        const result = this.compareFinancing(valorFinanciado, taxaAnual, anos);
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
                entrada: (0, utils_1.formatMoney)(entrada),
                entradaPercentual: `${((entrada / valorImovel) * 100).toFixed(0)}%`,
                valorFinanciado: (0, utils_1.formatMoney)(valorFinanciado),
                sac: {
                    primeira: (0, utils_1.formatMoney)(result.sac.primeira),
                    ultima: (0, utils_1.formatMoney)(result.sac.ultima),
                    totalJuros: (0, utils_1.formatMoney)(result.sac.totalJuros),
                },
                price: {
                    parcela: (0, utils_1.formatMoney)(result.price.parcelaFixa),
                    totalJuros: (0, utils_1.formatMoney)(result.price.totalJuros),
                },
            },
        };
    }
}
exports.default = FinancingCalc;
