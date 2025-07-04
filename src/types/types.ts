/* ==================== */
/*   creditCard TYPES   */
/* ==================== */

export interface creditCardPaga {
  status: string;
  valorRotativo: number;
  custoTotal: number;
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
  prestacao: number;
  juros: number;
  saldo: number;
}

export interface ParcelaDetalhesPRICE extends ParcelaDetalhes {
  amortizacao: number;
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
  valorFinanciado: number;
  prazo: string;
  taxa: string;
  totalJuros: number;
  totalPago: number;
  primeiraParcela: number;
  ultimaParcela: number;
  resumo: ResumoSAC;
}

export interface ResultadoPRICE {
  sistema: "Price";
  valorFinanciado: number;
  prazo: string;
  taxa: string;
  totalJuros: number;
  totalPago: number;
  prestacaoFixa: number;
  resumo: ResumoPRICE;
}

export interface Cenario {
  valor: number;
  prazo: string;
  taxa: string;
}

export interface SistemaComparacao {
  totalJuros: number;
  caracteristicas: string[];
}

export interface SACComparacao extends SistemaComparacao {
  primeira: number;
  ultima: number;
}

export interface PRICEComparacao extends SistemaComparacao {
  parcelaFixa: number;
}

export interface Recomendacao {
  sistema: "SAC" | "Price";
  motivo: string;
}

export interface Comparacao {
  economia: number;
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
  entrada: number;
  entradaPercentual: string;
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
  valorInicial: number;
  periodo: string;
  taxaMensal: string;
  montanteFinal: number;
  rendimento: number;
  rentabilidade: string;
  isento: true;
  observacao: string;
}

export interface ResultadoTesouroSelic {
  investimento: "Tesouro Selic";
  valorInicial: number;
  periodo: string;
  taxaAnual: string;
  montanteBruto: number;
  impostoRenda: number;
  aliquotaIR: string;
  montanteLiquido: number;
  rendimentoLiquido: number;
  rentabilidade: string;
  observacao: string;
}

export interface ResultadoCDB {
  investimento: string;
  valorInicial: number;
  periodo: string;
  taxaAnual: string;
  percentualCDI: string;
  montanteBruto: number;
  impostoRenda: number;
  aliquotaIR: string;
  montanteLiquido: number;
  rendimentoLiquido: number;
  rentabilidade: string;
}

export interface OpcaoInvestimento {
  nome: string;
  rendimento: number;
  rentabilidade: string;
}

export interface OpcaoComparacao {
  nome: string;
  rendimento: number;
  rentabilidade: string;
}

export interface CenarioComparacao {
  valor: number;
  periodo: string;
  dataAnalise: string;
}

export interface OpcoesComparacao {
  poupanca: {
    rendimento: number;
    rentabilidade: string;
  };
  tesouroSelic: {
    rendimento: number;
    rentabilidade: string;
  };
  cdbs: OpcaoComparacao[];
}

export interface MelhorOpcao {
  nome: string;
  rendimento: number;
  rentabilidade: string;
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

export interface SimulacaoAportes {
  simulacao: "Aportes Mensais";
  valorInicial: number;
  aporteMensal: number;
  periodo: string;
  taxaAnual: string;
  totalAportado: number;
  montanteBruto: number;
  rendimentoBruto: number;
  impostoRenda: string | number;
  montanteLiquido: number;
  rendimentoLiquido: number;
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
