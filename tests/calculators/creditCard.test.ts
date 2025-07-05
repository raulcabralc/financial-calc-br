import CreditCardCalc from "../../src/calculators/creditCard";

describe("CreditCardCalc", () => {
  let calc: CreditCardCalc;

  beforeEach(() => {
    calc = new CreditCardCalc();
  });

  /* ================== */
  /*   calcRotativo()   */
  /* ================== */

  describe("calcRotativo", () => {
    test("deve retornar fatura paga quando valor pago >= valor da fatura", () => {
      const result = calc.calcRotativo(1000, 1000);

      expect(result).toEqual({
        status: "Fatura paga integralmente",
        valorRotativo: 0,
        custoTotal: 0,
      });
    });

    test("deve retornar fatura paga quando valor pago > valor da fatura", () => {
      const result = calc.calcRotativo(1000, 1200);

      expect(result).toEqual({
        status: "Fatura paga integralmente",
        valorRotativo: 0,
        custoTotal: 0,
      });
    });

    test("deve calcular rotativo corretamente com taxa padrão", () => {
      const result = calc.calcRotativo(1000, 500);

      expect(result).toMatchObject({
        valorFatura: 1000,
        valorPago: 500,
        valorRotativo: 500,
        juros: 75,
        iof: 1.9,
        custoTotal: 76.9,
        proximaFatura: 576.9,
        formatted: {
          valorFatura: "R$ 1000,00",
          valorPago: "R$ 500,00",
          valorRotativo: "R$ 500,00",
          juros: "R$ 75,00",
          iof: "R$ 1,90",
          custoTotal: "R$ 76,90",
          proximaFatura: "R$ 576,90",
          alerta: "Custo alto",
        },
      });
    });

    test("deve calcular rotativo com taxa customizada", () => {
      const result = calc.calcRotativo(1000, 500, 20);

      expect(result).toMatchObject({
        valorFatura: 1000,
        valorPago: 500,
        valorRotativo: 500,
        juros: 100,
        iof: 1.9,
        custoTotal: 101.9,
        proximaFatura: 601.9,
      });
    });

    test("deve alertar sobre custo alto", () => {
      const result = calc.calcRotativo(1000, 900, 30);

      expect(result).toMatchObject({
        alerta: "Custo alto",
      });
    });

    test("deve alertar sobre custo OK", () => {
      const result = calc.calcRotativo(1000, 500, 5);

      expect(result).toMatchObject({
        alerta: "Custo OK",
      });
    });

    test("deve calcular corretamente com valores decimais", () => {
      const result = calc.calcRotativo(1000.5, 500.25);

      expect(result).toMatchObject({
        valorFatura: 1000.5,
        valorPago: 500.25,
        valorRotativo: 500.25,
      });
    });

    test("deve calcular com valor mínimo", () => {
      const result = calc.calcRotativo(100, 10);

      expect(result).toMatchObject({
        valorFatura: 100,
        valorPago: 10,
        valorRotativo: 90,
      });
    });

    test("deve calcular com zero pago", () => {
      const result = calc.calcRotativo(1000, 0);

      expect(result).toMatchObject({
        valorFatura: 1000,
        valorPago: 0,
        valorRotativo: 1000,
      });
    });
  });
});
