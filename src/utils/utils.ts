import {
  ValidationResultUtils,
  CompoundInterestResult,
  RateConversion,
} from "../types/types";

/**
 * Formata valor numérico para moeda brasileira (BRL)
 * @param {number} valor - Valor numérico a ser formatado
 * @returns {string} Valor formatado em moeda brasileira (R$ 1.000,00)
 */
function formatMoney(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Converte string de moeda para número
 * @param {number | string} valor - Valor em formato de moeda ou número
 * @returns {number} Valor numérico convertido
 */
function parseMoney(valor: number | string): number {
  if (typeof valor === "number") return valor;
  return parseFloat(valor.replace(/[R$\.\s]/g, "").replace(",", "."));
}

/**
 * Converte taxa de juros entre diferentes períodos
 * @param {number} taxa - Taxa de juros a ser convertida
 * @param {RateConversion} de - Período de origem ("anual" ou "mensal")
 * @param {RateConversion} para - Período de destino ("anual" ou "mensal")
 * @returns {number} Taxa convertida para o período desejado
 */
function convertRate(
  taxa: number,
  de: RateConversion,
  para: RateConversion
): number {
  if (de === "anual" && para === "mensal") {
    return (Math.pow(1 + taxa / 100, 1 / 12) - 1) * 100;
  }
  if (de === "mensal" && para === "anual") {
    return (Math.pow(1 + taxa / 100, 12) - 1) * 100;
  }
  return taxa;
}

/**
 * Calcula a alíquota do Imposto de Renda baseada no prazo
 * @param {number} dias - Número de dias do investimento
 * @returns {number} Alíquota do IR (15%, 17.5%, 20% ou 22.5%)
 */
function calcIRRate(dias: number): number {
  if (dias <= 180) return 22.5;
  if (dias <= 360) return 20;
  if (dias <= 720) return 17.5;
  return 15;
}

/**
 * Verifica se o valor é um número válido
 * @param {any} valor - Valor a ser validado
 * @returns {boolean} True se for um número válido, false caso contrário
 */
function isValidNumber(valor: any): valor is number {
  return typeof valor === "number" && !isNaN(valor) && isFinite(valor);
}

/**
 * Valida parâmetros financeiros básicos
 * @param {number} valor - Valor a ser validado (deve ser positivo)
 * @param {number} taxa - Taxa a ser validada (deve ser positiva ou zero)
 * @param {number} tempo - Tempo a ser validado (deve ser positivo)
 * @returns {ValidationResultUtils} Objeto com resultado da validação e lista de erros
 */
function validateFinancialParams(
  valor: number,
  taxa: number,
  tempo: number
): ValidationResultUtils {
  const errors: string[] = [];

  if (!isValidNumber(valor) || valor <= 0) {
    errors.push("Valor deve ser um número positivo");
  }

  if (!isValidNumber(taxa) || taxa < 0) {
    errors.push("Taxa deve ser um número positivo ou zero");
  }

  if (!isValidNumber(tempo) || tempo <= 0) {
    errors.push("Tempo deve ser um número positivo");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

/**
 * Formata período em meses para formato legível
 * @param {number} meses - Número de meses
 * @returns {string} Período formatado (ex: "2 anos e 3 meses")
 */
function formatPeriod(meses: number): string {
  if (!isValidNumber(meses) || meses < 0) {
    throw new Error("Número de meses deve ser um número positivo");
  }

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

/**
 * Calcula diferença percentual entre dois valores
 * @param {number} valor1 - Primeiro valor
 * @param {number} valor2 - Segundo valor (base para cálculo)
 * @returns {number} Diferença percentual entre os valores
 */
function calcPercentDifference(valor1: number, valor2: number): number {
  if (valor2 === 0) return 0;
  return ((valor1 - valor2) / valor2) * 100;
}

/**
 * Calcula juros compostos
 * @param {number} capital - Valor inicial do investimento
 * @param {number} taxaAnual - Taxa de juros anual (em percentual)
 * @param {number} anos - Período de investimento em anos
 * @returns {CompoundInterestResult} Objeto com resultado do cálculo de juros compostos
 */
function compoundInterest(
  capital: number,
  taxaAnual: number,
  anos: number
): CompoundInterestResult {
  const validation = validateFinancialParams(capital, taxaAnual, anos);
  if (!validation.isValid) {
    throw new Error(`Parâmetros inválidos: ${validation.errors.join(", ")}`);
  }

  const parcelas = anos * 12;
  const taxaMensal = convertRate(taxaAnual, "anual", "mensal");

  const montante = capital * Math.pow(1 + taxaMensal / 100, parcelas);
  return {
    capital: capital,
    taxa: taxaMensal,
    periodo: formatPeriod(anos * 12),
    montante: Math.round(montante * 100) / 100,
    juros: Math.round((montante - capital) * 100) / 100,
  };
}

export {
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
