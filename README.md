# Financial Calc BR 🇧🇷

[![npm version](https://badge.fury.io/js/financial-calc-br.svg)](https://badge.fury.io/js/financial-calc-br)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Uma calculadora financeira completa para o mercado brasileiro, incluindo cálculos de financiamentos (SAC e Price), investimentos (CDB, Tesouro Selic, Poupança) e cartão de crédito rotativo.

## 📦 Instalação

### NPM

```bash
npm install financial-calc-br
```

### Yarn

```bash
yarn add financial-calc-br
```

## 🚀 Uso Básico

### Calculadora de Financiamentos

```typescript
import { FinancingCalc } from "financial-calc-br";

const calc = new FinancingCalc();

// Calcular financiamento SAC
const sac = calc.financingSAC(300000, 10.5, 30);
console.log(sac.formatted.primeiraParcela); // "R$ 3.125,00"

// Calcular financiamento Price
const price = calc.financingPrice(300000, 10.5, 30);
console.log(price.formatted.prestacaoFixa); // "R$ 2.738,95"

// Comparar os dois sistemas
const comparacao = calc.compareFinancing(300000, 10.5, 30);
console.log(comparacao.comparacao.recomendacao);
```

### Calculadora de Investimentos

```typescript
import { InvestmentCalc } from "financial-calc-br";

const calc = new InvestmentCalc();

// Calcular rendimento da poupança
const poupanca = calc.investmentPoupanca(10000, 12);
console.log(poupanca.formatted.rendimento); // "R$ 617,00"

// Calcular CDB
const cdb = calc.investmentCDB(10000, 12, 110); // 110% do CDI
console.log(cdb.formatted.rendimentoLiquido); // "R$ 876,32"

// Comparar investimentos
const comparacao = calc.compareInvestments(10000, 12);
console.log(comparacao.melhorOpcao.nome); // "CDB 120% CDI"
```

### Calculadora de Cartão de Crédito

```typescript
import { CreditCardCalc } from "financial-calc-br";

const calc = new CreditCardCalc();

// Calcular rotativo do cartão
const rotativo = calc.calcRotativo(1000, 300, 15); // Fatura R$ 1000, pagou R$ 300, taxa 15%
console.log(rotativo.formatted.custoTotal); // "R$ 107,66"
console.log(rotativo.alerta); // "Custo alto"
```

## 📊 Funcionalidades

### 🏠 Financiamentos
- **Sistema SAC**: Parcelas decrescentes, menor custo total
- **Sistema Price**: Parcelas fixas, facilita planejamento
- **Comparação**: Análise automática dos dois sistemas
- **Simulação de entrada**: Calcule diferentes cenários de entrada

### 💰 Investimentos
- **Poupança**: Cálculo com regras atuais (isento de IR)
- **Tesouro Selic**: Com tributação regressiva
- **CDB**: Diversos percentuais do CDI
- **Aportes mensais**: Simulação de investimentos recorrentes
- **Taxas atualizadas**: Busca automática de taxas Selic e CDI

### 💳 Cartão de Crédito
- **Rotativo**: Cálculo de juros e IOF
- **Alertas**: Identifica custos altos automaticamente
- **Próxima fatura**: Projeção do valor da próxima fatura

## 🛠️ API Completa

### FinancingCalc

```typescript
// Financiamento SAC
financingSAC(valor: number, taxaAnual: number, anos: number): ResultadoSAC

// Financiamento Price
financingPrice(valor: number, taxaAnual: number, anos: number): ResultadoPRICE

// Comparar sistemas
compareFinancing(valor: number, taxaAnual: number, anos: number): ResultadoComparacao

// Simular entrada
simulateDownPayment(valorImovel: number, entrada: number, taxaAnual: number, anos: number): SimulacaoEntrada
```

### InvestmentCalc

```typescript
// Poupança
investmentPoupanca(valor: number, meses: number): ResultadoPoupanca

// Tesouro Selic
investmentTesouroSelic(valor: number, meses: number): ResultadoTesouroSelic

// CDB
investmentCDB(valor: number, meses: number, percentualCDI: number): ResultadoCDB

// Comparar investimentos
compareInvestments(valor: number, meses: number, opcoes?: number[]): ResultadoComparacaoInvestment

// Aportes mensais
simulateMonthlyContributions(valorInicial: number, aporteMensal: number, meses: number, taxaAnual: number, temIR?: boolean): SimulacaoAportes
```

### CreditCardCalc

```typescript
// Rotativo do cartão
calcRotativo(valorFatura: number, valorPago: number, taxaMensal?: number): creditCard | creditCardPaga
```

### RatesManager

```typescript
// Buscar taxas atualizadas
updateAll(): Promise<Rates>

// Obter taxas individuais
getSelic(): number
getCDI(): number
getPoupanca(): number
getDolar(): number
getIPCA(): number

// Obter todas as taxas
getAllRates(): AllRates
```

## 🔧 Utilitários

```typescript
import { formatMoney, parseMoney, convertRate, calcIRRate } from "financial-calc-br";

// Formatação
formatMoney(1234.56); // "R$ 1.234,56"
parseMoney("R$ 1.234,56"); // 1234.56

// Conversão de taxas
convertRate(12, "anual", "mensal"); // 0.9489
convertRate(1, "mensal", "anual"); // 12.6825

// Cálculo de IR
calcIRRate(90); // 22.5 (90 dias = 22.5%)
calcIRRate(400); // 17.5 (400 dias = 17.5%)
```

## 📈 Exemplos Práticos

### Comparando Financiamento de R$ 500.000

```typescript
const calc = new FinancingCalc();
const resultado = calc.compareFinancing(500000, 11.5, 30);

console.log(`SAC - Primeira parcela: ${resultado.sac.primeira}`);
console.log(`Price - Parcela fixa: ${resultado.price.parcelaFixa}`);
console.log(`Economia escolhendo SAC: ${resultado.comparacao.formatted.economia}`);
console.log(`Recomendação: ${resultado.comparacao.recomendacao.sistema}`);
```

### Simulando Investimento com Aportes

```typescript
const calc = new InvestmentCalc();
const simulacao = calc.simulateMonthlyContributions(10000, 1000, 24, 12);

console.log(`Total aportado: ${simulacao.formatted.totalAportado}`);
console.log(`Rendimento líquido: ${simulacao.formatted.rendimentoLiquido}`);
console.log(`Montante final: ${simulacao.formatted.montanteLiquido}`);
```

## 🇧🇷 Específico para o Brasil

- **Taxas reais**: Integração com APIs do Banco Central
- **Tributação brasileira**: IR progressivo e regressivo
- **Regras da poupança**: Aplicação automática das regras atuais
- **Formatação**: Valores em Real (R$) e períodos em português
- **IOF**: Cálculo automático para cartão de crédito

## 📝 Licença

MIT © [Raul Cabral](https://github.com/raulcabralc)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

## 🐛 Bugs e Sugestões

Encontrou um bug ou tem uma sugestão? Abra uma [issue](https://github.com/raulcabralc/financial-calc-br/issues).

## 📊 Roadmap

- [ ] Calculadora de aposentadoria
- [ ] Simulador de empréstimos
- [ ] Calculadora de impostos
- [ ] Integração com mais APIs financeiras
- [ ] Dashboard web interativo