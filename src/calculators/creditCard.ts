import { formatMoney } from "../utils/utils";
import { creditCardPaga, creditCard } from "../types/types";

class creditCardCalc {
  calcRotativo(
    valorFatura: number,
    valorPago: number,
    taxaMensal: number = 15
  ): creditCard | creditCardPaga {
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
        valorFatura: formatMoney(valorFatura),
        valorPago: formatMoney(valorPago),
        valorRotativo: formatMoney(valorRotativo),
        juros: formatMoney(juros),
        iof: formatMoney(iof),
        custoTotal: formatMoney(custoTotal),
        proximaFatura: formatMoney(valorRotativo + custoTotal),
        alerta: custoTotal > valorRotativo * 0.1 ? "Custo alto" : "Custo OK",
      },
    };
  }
}

export default creditCardCalc;
