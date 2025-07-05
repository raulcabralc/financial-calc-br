export interface creditCardPaga {
    status: string;
    valorRotativo: number;
    custoTotal: number;
}
interface creditCardFormatted {
    valorFatura: string;
    valorPago: string;
    valorRotativo: string;
    juros: string;
    iof: string;
    custoTotal: string;
    proximaFatura: string;
    alerta: string;
}
export interface creditCard {
    valorFatura: number;
    valorPago: number;
    valorRotativo: number;
    juros: number;
    iof: number;
    custoTotal: number;
    proximaFatura: number;
    alerta: string;
    formatted: creditCardFormatted;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface ParcelaDetalhes {
    parcela: number;
    prestacao: number;
    juros: number;
    saldo: number;
}
export interface ParcelaDetalhesPRICE extends ParcelaDetalhes {
    amortizacao: number;
}
interface ResumoSAC {
    primeiros12: ParcelaDetalhes[];
    ultimos12: ParcelaDetalhes[];
}
interface ResumoPRICE {
    primeiros12: ParcelaDetalhesPRICE[];
    ultimos12: ParcelaDetalhesPRICE[];
}
interface ResultadoSACFormatted {
    sistema: "SAC";
    valorFinanciado: string;
    prazo: string;
    taxa: string;
    totalJuros: string;
    totalPago: string;
    primeiraParcela: string;
    ultimaParcela: string;
}
export interface ResultadoSAC {
    sistema: "SAC";
    valorFinanciado: number;
    prazo: number;
    taxa: number;
    totalJuros: number;
    totalPago: number;
    primeiraParcela: number;
    ultimaParcela: number;
    resumo: ResumoSAC;
    formatted: ResultadoSACFormatted;
}
interface ResultadoPRICEFormatted {
    sistema: "Price";
    valorFinanciado: string;
    prazo: string;
    taxa: string;
    totalJuros: string;
    totalPago: string;
    prestacaoFixa: string;
}
export interface ResultadoPRICE {
    sistema: "Price";
    valorFinanciado: number;
    prazo: number;
    taxa: number;
    totalJuros: number;
    totalPago: number;
    prestacaoFixa: number;
    resumo: ResumoPRICE;
    formatted: ResultadoPRICEFormatted;
}
interface Cenario {
    valor: number;
    prazo: string;
    taxa: string;
}
interface SistemaComparacao {
    totalJuros: number;
    caracteristicas: string[];
}
interface SACComparacao extends SistemaComparacao {
    primeira: number;
    ultima: number;
}
interface PRICEComparacao extends SistemaComparacao {
    parcelaFixa: number;
}
export interface Recomendacao {
    sistema: "SAC" | "Price";
    motivo: string;
}
interface ComparacaoFormatted {
    economia: string;
    economiaPercentual: string;
}
export interface Comparacao {
    economia: number;
    economiaPercentual: number;
    recomendacao: Recomendacao;
    formatted: ComparacaoFormatted;
}
export interface ResultadoComparacao {
    cenario: Cenario;
    sac: SACComparacao;
    price: PRICEComparacao;
    comparacao: Comparacao;
}
interface SimulacaoEntradaFormatted {
    entrada: string;
    entradaPercentual: string;
    valorFinanciado: string;
    sac: {
        primeira: string;
        ultima: string;
        totalJuros: string;
    };
    price: {
        parcela: string;
        totalJuros: string;
    };
}
export interface SimulacaoEntrada {
    entrada: number;
    entradaPercentual: number;
    valorFinanciado: number;
    sac: {
        primeira: number;
        ultima: number;
        totalJuros: number;
    };
    price: {
        parcela: number;
        totalJuros: number;
    };
    formatted: SimulacaoEntradaFormatted;
}
export interface ValidationResultInvestment {
    isValid: boolean;
    errors: string[];
}
export interface TaxasUtilizadas {
    selic: string;
    cdi: string;
    poupanca: string;
    atualizadoEm: string;
}
interface ResultadoPoupancaFormatted {
    valorInicial: string;
    periodo: string;
    taxaMensal: string;
    montanteFinal: string;
    rendimento: string;
    rentabilidade: string;
}
export interface ResultadoPoupanca {
    investimento: "Poupança";
    valorInicial: number;
    periodo: number;
    taxaMensal: number;
    montanteFinal: number;
    rendimento: number;
    rentabilidade: number;
    isento: true;
    observacao: string;
    formatted: ResultadoPoupancaFormatted;
}
interface ResultadoTesouroSelicFormatted {
    valorInicial: string;
    periodo: string;
    taxaAnual: string;
    montanteBruto: string;
    impostoRenda: string;
    aliquotaIR: string;
    montanteLiquido: string;
    rendimentoLiquido: string;
    rentabilidade: string;
}
export interface ResultadoTesouroSelic {
    investimento: "Tesouro Selic";
    valorInicial: number;
    periodo: number;
    taxaAnual: number;
    montanteBruto: number;
    impostoRenda: number;
    aliquotaIR: number;
    montanteLiquido: number;
    rendimentoLiquido: number;
    rentabilidade: number;
    observacao: string;
    formatted: ResultadoTesouroSelicFormatted;
}
interface ResultadoCDBFormatted {
    valorInicial: string;
    periodo: string;
    taxaAnual: string;
    percentualCDI: string;
    montanteBruto: string;
    impostoRenda: string;
    aliquotaIR: string;
    montanteLiquido: string;
    rendimentoLiquido: string;
    rentabilidade: string;
}
export interface ResultadoCDB {
    investimento: string;
    valorInicial: number;
    periodo: number;
    taxaAnual: number;
    percentualCDI: number;
    montanteBruto: number;
    impostoRenda: number;
    aliquotaIR: number;
    montanteLiquido: number;
    rendimentoLiquido: number;
    rentabilidade: number;
    formatted: ResultadoCDBFormatted;
}
export interface OpcaoInvestimento {
    nome: string;
    rendimento: number;
    rentabilidade: number;
}
export interface OpcaoComparacao {
    nome: string;
    rendimento: number;
    rentabilidade: number;
}
export interface CenarioComparacao {
    valor: number;
    periodo: string;
    dataAnalise: string;
}
export interface OpcoesComparacao {
    poupanca: {
        rendimento: number;
        rentabilidade: number;
    };
    tesouroSelic: {
        rendimento: number;
        rentabilidade: number;
    };
    cdbs: OpcaoComparacao[];
}
export interface MelhorOpcao {
    nome: string;
    rendimento: number;
    rentabilidade: number;
    vantagem: number;
}
export interface ResultadoComparacaoInvestment {
    cenario: CenarioComparacao;
    opcoes: OpcoesComparacao;
    ranking: OpcaoInvestimento[];
    melhorOpcao: MelhorOpcao;
    taxasUtilizadas: TaxasUtilizadas;
}
export interface EvolucaoMensal {
    mes: number;
    montante: number;
    totalAportado: number;
    rendimento: number;
}
interface SimulacaoAportesFormatted {
    valorInicial: string;
    aporteMensal: string;
    periodo: string;
    taxaAnual: string;
    totalAportado: string;
    montanteBruto: string;
    rendimentoBruto: string;
    impostoRenda: string;
    montanteLiquido: string;
    rendimentoLiquido: string;
    rentabilidadeTotal: string;
}
export interface SimulacaoAportes {
    simulacao: "Aportes Mensais";
    valorInicial: number;
    aporteMensal: number;
    periodo: number;
    taxaAnual: number;
    totalAportado: number;
    montanteBruto: number;
    rendimentoBruto: number;
    impostoRenda: number;
    montanteLiquido: number;
    rendimentoLiquido: number;
    rentabilidadeTotal: number;
    evolucao: EvolucaoMensal[];
    formatted: SimulacaoAportesFormatted;
}
export interface Rates {
    selic: number;
    cdi: number;
    ipca: number;
    dolar: number;
    poupanca: number;
}
export interface FormattedRates {
    selic: string;
    cdi: string;
    poupanca: string;
    dolar: string;
    ipca: string;
}
export interface AllRates extends Rates {
    formatted: FormattedRates;
}
export interface SelicApiResponse {
    data: string;
    valor: string;
}
export interface DolarApiResponse {
    rates: {
        BRL: number;
        [key: string]: number;
    };
}
export interface ValidationResultUtils {
    isValid: boolean;
    errors: string[];
}
export interface CompoundInterestResult {
    capital: number;
    taxa: number;
    periodo: string;
    montante: number;
    juros: number;
}
export type RateConversion = "anual" | "mensal";
export {};
