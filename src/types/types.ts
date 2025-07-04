/* ==================== */
/*   creditCard TYPES   */
/* ==================== */

export interface creditCardPaga {
  status: string;
  valorRotativo: number;
  custoTotal: number;
}

export interface creditCard {
  valorFatura: string;
  valorPago: string;
  valorRotativo: string;
  juros: string;
  iof: string;
  custoTotal: string;
  proximaFatura: string;
  alerta: string;
}

/* =================== */
/*   financing TYPES   */
/* =================== */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ParcelaDetalhes {
  parcela: number;
  prestacao: string;
  juros: string;
  saldo: string;
}

export interface ParcelaDetalhesPRICE extends ParcelaDetalhes {
  amortizacao: string;
}

export interface ResumoSAC {
  primeiros12: ParcelaDetalhes[];
  ultimos12: ParcelaDetalhes[];
}

export interface ResumoPRICE {
  primeiros12: ParcelaDetalhesPRICE[];
  ultimos12: ParcelaDetalhesPRICE[];
}

export interface ResultadoSAC {
  sistema: "SAC";
  valorFinanciado: string;
  prazo: string;
  taxa: string;
  totalJuros: string;
  totalPago: string;
  primeiraParcela: string;
  ultimaParcela: string;
  resumo: ResumoSAC;
}

export interface ResultadoPRICE {
  sistema: "Price";
  valorFinanciado: string;
  prazo: string;
  taxa: string;
  totalJuros: string;
  totalPago: string;
  prestacaoFixa: string;
  resumo: ResumoPRICE;
}

export interface Cenario {
  valor: string;
  prazo: string;
  taxa: string;
}

export interface SistemaComparacao {
  totalJuros: string;
  caracteristicas: string[];
}

export interface SACComparacao extends SistemaComparacao {
  primeira: string;
  ultima: string;
}

export interface PRICEComparacao extends SistemaComparacao {
  parcelaFixa: string;
}

export interface Recomendacao {
  sistema: "SAC" | "Price";
  motivo: string;
}

export interface Comparacao {
  economia: string;
  economiaPercentual: string;
  recomendacao: Recomendacao;
}

export interface ResultadoComparacao {
  cenario: Cenario;
  sac: SACComparacao;
  price: PRICEComparacao;
  comparacao: Comparacao;
}

export interface SimulacaoEntrada {
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

/* ===================== */
/*   investments TYPES   */
/* ===================== */

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

export interface ResultadoPoupanca {
  investimento: "Poupança";
  valorInicial: string;
  periodo: string;
  taxaMensal: string;
  montanteFinal: string;
  rendimento: string;
  rentabilidade: string;
  isento: true;
  observacao: string;
}

export interface ResultadoTesouroSelic {
  investimento: "Tesouro Selic";
  valorInicial: string;
  periodo: string;
  taxaAnual: string;
  montanteBruto: string;
  impostoRenda: string;
  aliquotaIR: string;
  montanteLiquido: string;
  rendimentoLiquido: string;
  rentabilidade: string;
  observacao: string;
}

export interface ResultadoCDB {
  investimento: string;
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

export interface OpcaoInvestimento {
  nome: string;
  rendimento: number;
  rentabilidade: string;
}

export interface OpcaoComparacao {
  nome: string;
  rendimento: string;
  rentabilidade: string;
}

export interface CenarioComparacao {
  valor: string;
  periodo: string;
  dataAnalise: string;
}

export interface OpcoesComparacao {
  poupanca: {
    rendimento: string;
    rentabilidade: string;
  };
  tesouroSelic: {
    rendimento: string;
    rentabilidade: string;
  };
  cdbs: OpcaoComparacao[];
}

export interface MelhorOpcao {
  nome: string;
  rendimento: string;
  rentabilidade: string;
  vantagem: string;
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
  montante: string;
  totalAportado: string;
  rendimento: string;
}

export interface SimulacaoAportes {
  simulacao: "Aportes Mensais";
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
  evolucao: EvolucaoMensal[];
}

/* ================= */
/*    rates TYPES    */
/* ================= */

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

/* =============== */
/*   utils TYPES   */
/* =============== */

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
