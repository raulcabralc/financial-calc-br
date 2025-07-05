"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
class creditCardCalc {
    calcRotativo(valorFatura, valorPago, taxaMensal = 15) {
        if (valorPago >= valorFatura) {
            return {
                status: "Fatura paga integralmente",
                valorRotativo: 0,
                custoTotal: 0,
            };
        }
        const valorRotativo = valorFatura - valorPago;
        const juros = valorRotativo * (taxaMensal / 100);
        const iof = valorRotativo * 0.0038;
        const custoTotal = juros + iof;
        return {
            valorFatura: valorFatura,
            valorPago: valorPago,
            valorRotativo: valorRotativo,
            juros: juros,
            iof: iof,
            custoTotal: custoTotal,
            proximaFatura: valorRotativo + custoTotal,
            alerta: custoTotal > valorRotativo * 0.1 ? "Custo alto" : "Custo OK",
            formatted: {
                valorFatura: (0, utils_1.formatMoney)(valorFatura),
                valorPago: (0, utils_1.formatMoney)(valorPago),
                valorRotativo: (0, utils_1.formatMoney)(valorRotativo),
                juros: (0, utils_1.formatMoney)(juros),
                iof: (0, utils_1.formatMoney)(iof),
                custoTotal: (0, utils_1.formatMoney)(custoTotal),
                proximaFatura: (0, utils_1.formatMoney)(valorRotativo + custoTotal),
                alerta: custoTotal > valorRotativo * 0.1 ? "Custo alto" : "Custo OK",
            },
        };
    }
}
exports.default = creditCardCalc;
