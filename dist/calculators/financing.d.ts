import { ResultadoSAC, ResultadoPRICE, Recomendacao, ResultadoComparacao, SimulacaoEntrada } from "../types/types";
declare class FinancingCalc {
    financingSAC(valor: number, taxaAnual: number, anos: number): ResultadoSAC;
    financingPrice(valor: number, taxaAnual: number, anos: number): ResultadoPRICE;
    compareFinancing(valor: number, taxaAnual: number, anos: number): ResultadoComparacao;
    getRecommendation(sacJuros: number, priceJuros: number, primeiraSAC: number, parcelaPrice: number): Recomendacao;
    simulateDownPayment(valorImovel: number, entrada: number, taxaAnual: number, anos: number): SimulacaoEntrada;
}
export default FinancingCalc;
