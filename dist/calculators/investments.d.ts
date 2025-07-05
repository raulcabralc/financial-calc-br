import { ResultadoCDB, ResultadoTesouroSelic, ResultadoPoupanca, SimulacaoAportes, ResultadoComparacaoInvestment } from "../types/types";
declare class InvestmentCalc {
    private rates;
    constructor();
    investmentPoupanca(valor: number, meses: number): ResultadoPoupanca;
    investmentTesouroSelic(valor: number, meses: number): ResultadoTesouroSelic;
    investmentCDB(valor: number, meses: number, percentualCDI?: number): ResultadoCDB;
    compareInvestments(valor: number, meses: number, opcoes?: number[]): ResultadoComparacaoInvestment;
    simulateMonthlyContributions(valorInicial: number, aporteMensal: number, meses: number, taxaAnual: number, temIR?: boolean): SimulacaoAportes;
}
export default InvestmentCalc;
