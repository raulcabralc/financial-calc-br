function formatMoney(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function parseMoney(valor) {
  if (typeof valor === "number") return valor;
  return parseFloat(valor.replace(/[R$\.\s]/g, "").replace(",", "."));
}

function convertRate(taxa, de, para) {
  if (de === "anual" && para === "mensal") {
    return (Math.pow(1 + taxa / 100, 1 / 12) - 1) * 100;
  }
  if (de === "mensal" && para === "anual") {
    return (Math.pow(1 + taxa / 100, 12) - 1) * 100;
  }
  return taxa;
}

function calcIRRate(dias) {
  if (dias <= 180) return 22.5;
  if (dias <= 360) return 20;
  if (dias <= 720) return 17.5;
  return 15;
}

function isValidNumber(valor) {
  return typeof valor === "number" && !isNaN(valor) && isFinite(valor);
}

function validateFinancialParams(valor, taxa, tempo) {
  const errors = [];

  if (!isValidNumber(valor) || valor <= 0) {
    errors.push("Valor deve ser um número positivo");
  }

  if (!isValidNumber(taxa) || taxa < 0) {
    errors.push("Taxa deve ser um número positivo");
  }

  if (!isValidNumber(tempo) || tempo <= 0) {
    errors.push("Tempo deve ser um número positivo");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

function formatPeriod(meses) {
  if (meses < 12) {
    return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  }

  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  let resultado = `${anos} ${anos === 1 ? "ano" : "anos"}`;

  if (mesesRestantes > 0) {
    resultado += ` e ${mesesRestantes} ${
      mesesRestantes === 1 ? "mês" : "meses"
    }`;
  }

  return resultado;
}

function calcPercentDifference(valor1, valor2) {
  if (valor2 === 0) return 0;
  return ((valor1 - valor2) / valor2) * 100;
}

function compoundInterest(capital, taxaAnual, anos) {
  const parcelas = anos * 12;
  const taxaMensal = convertRate(taxaAnual, "anual", "mensal");

  const montante = capital * Math.pow(1 + taxaMensal / 100, parcelas);
  return {
    capital: capital,
    taxa: taxaMensal,
    periodo: formatPeriod(anos),
    montante: Math.round(montante * 100) / 100,
    juros: Math.round((montante - capital) * 100) / 100,
  };
}

module.exports = {
  formatMoney,
  parseMoney,
  convertRate,
  calcIRRate,
  isValidNumber,
  validateFinancialParams,
  formatPeriod,
  calcPercentDifference,
  compoundInterest,
};
