import { formatMoney } from "../utils/utils";
import { creditCardPaga, creditCard } from "../types/types";

class CreditCardCalc {
  /**
   * Calcula o valor do crédito rotativo do cartão de crédito
   * @param {number} valorFatura - Valor total da fatura do cartão
   * @param {number} valorPago - Valor efetivamente pago pelo usuário
   * @param {number} taxaMensal - Taxa mensal de juros do rotativo (padrão: 15%)
   * @returns {creditCard | creditCardPaga} Objeto com detalhes do rotativo ou confirmação de pagamento integral
   */
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
    const alerta = custoTotal > valorRotativo * 0.1 ? "Custo alto" : "Custo OK";

    return {
      valorFatura: valorFatura,
      valorPago: valorPago,
      valorRotativo: valorRotativo,
      juros: juros,
      iof: iof,
      custoTotal: custoTotal,
      proximaFatura: valorRotativo + custoTotal,
      alerta,
      formatted: {
        valorFatura: formatMoney(valorFatura),
        valorPago: formatMoney(valorPago),
        valorRotativo: formatMoney(valorRotativo),
        juros: formatMoney(juros),
        iof: formatMoney(iof),
        custoTotal: formatMoney(custoTotal),
        proximaFatura: formatMoney(valorRotativo + custoTotal),
        alerta,
      },
    };
  }
}

export default CreditCardCalc;
