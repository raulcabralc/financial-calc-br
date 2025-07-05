import https from "https";
import RatesManager from "../../src/services/rates";

jest.mock("https", () => ({
  request: jest.fn(),
}));

describe("RatesManager", () => {
  let ratesManager: RatesManager;
  const mockHttps = require("https");

  beforeEach(() => {
    ratesManager = new RatesManager();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  /* ====================== */
  /*    Valores Iniciais    */
  /* ====================== */

  describe("Valores padrão", () => {
    test("deve inicializar com valores padrão corretos", () => {
      expect(ratesManager.getSelic()).toBe(10.75);
      expect(ratesManager.getCDI()).toBe(10.5);
      expect(ratesManager.getIPCA()).toBe(4.5);
      expect(ratesManager.getDolar()).toBe(5.2);
      expect(ratesManager.getPoupanca()).toBe(0.5);
    });

    test("deve formatar todas as taxas corretamente", () => {
      const allRates = ratesManager.getAllRates();

      expect(allRates.formatted.selic).toBe("10.75% a.a.");
      expect(allRates.formatted.cdi).toBe("10.50% a.a.");
      expect(allRates.formatted.poupanca).toBe("0.50% a.m.");
      expect(allRates.formatted.dolar).toBe("R$ 5.20");
      expect(allRates.formatted.ipca).toBe("4.5% a.a.");
    });
  });

  /* ========================= */
  /*    updateSavingsRule()    */
  /* ========================= */

  describe("Regra da Poupança", () => {
    test("deve aplicar regra quando Selic <= 8.5%", () => {
      ratesManager = new RatesManager();
      ratesManager["rates"].selic = 8.0;
      ratesManager["updateSavingsRule"]();

      const expectedPoupanca = (8.0 / 12) * 0.7;
      expect(ratesManager.getPoupanca()).toBeCloseTo(expectedPoupanca, 2);
    });

    test("deve manter 0.5% quando Selic > 8.5%", () => {
      ratesManager = new RatesManager();
      ratesManager["rates"].selic = 10.0;
      ratesManager["updateSavingsRule"]();

      expect(ratesManager.getPoupanca()).toBe(0.5);
    });
  });

  /* ================= */
  /*    updateAll()    */
  /* ================= */

  describe("updateAll", () => {
    let isolatedRatesManager: RatesManager;

    beforeEach(() => {
      isolatedRatesManager = new RatesManager();
      jest.clearAllMocks();
    });

    test("deve atualizar Selic com sucesso", async () => {
      const mockSelicResponse = JSON.stringify([
        { data: "2024-01-01", valor: "11.25" },
      ]);

      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === "error") return;
          if (event === "timeout") return;
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn((event, callback) => {
          if (event === "data") {
            setTimeout(() => callback(mockSelicResponse), 0);
          }
          if (event === "end") {
            setTimeout(() => callback(), 10);
          }
        }),
      };

      mockHttps.request.mockImplementation(
        (options: https.RequestOptions, callback: any) => {
          if (options.hostname === "api.bcb.gov.br") {
            setTimeout(() => callback(mockResponse), 0);
          } else {
            const emptyResponse = {
              on: jest.fn((event, callback) => {
                if (event === "data") setTimeout(() => callback(""), 0);
                if (event === "end") setTimeout(() => callback(), 10);
              }),
            };
            setTimeout(() => callback(emptyResponse), 0);
          }
          return mockRequest;
        }
      );

      await isolatedRatesManager.updateAll();

      expect(isolatedRatesManager.getSelic()).toBe(11.25);
      expect(isolatedRatesManager.getCDI()).toBeCloseTo(11.25 * 0.9, 2);
    }, 10000);

    test("deve atualizar Dólar com sucesso", async () => {
      const mockDolarResponse = JSON.stringify({ rates: { BRL: 5.45 } });

      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === "error") return;
          if (event === "timeout") return;
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn((event, callback) => {
          if (event === "data") {
            setTimeout(() => callback(mockDolarResponse), 0);
          }
          if (event === "end") {
            setTimeout(() => callback(), 10);
          }
        }),
      };

      mockHttps.request.mockImplementation(
        (options: https.RequestOptions, callback: any) => {
          if (options.hostname === "api.exchangerate-api.com") {
            setTimeout(() => callback(mockResponse), 0);
          } else {
            const emptyResponse = {
              on: jest.fn((event, callback) => {
                if (event === "data") setTimeout(() => callback(""), 0);
                if (event === "end") setTimeout(() => callback(), 10);
              }),
            };
            setTimeout(() => callback(emptyResponse), 0);
          }
          return mockRequest;
        }
      );

      await isolatedRatesManager.updateAll();

      expect(isolatedRatesManager.getDolar()).toBe(5.45);
    }, 10000);

    test("deve manter valores padrão em caso de erro", async () => {
      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === "error") {
            setTimeout(() => callback(new Error("Network error")), 0);
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };

      mockHttps.request.mockImplementation(() => mockRequest);

      const rates = await isolatedRatesManager.updateAll();

      expect(rates.selic).toBe(10.75);
      expect(rates.dolar).toBe(5.2);
    }, 10000);

    test("deve lidar com timeout", async () => {
      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === "timeout") {
            setTimeout(() => callback(), 0);
          }
        }),
        end: jest.fn(),
        destroy: jest.fn(),
      };

      mockHttps.request.mockImplementation(() => mockRequest);

      const rates = await isolatedRatesManager.updateAll();

      expect(rates.selic).toBe(10.75);
      expect(mockRequest.destroy).toHaveBeenCalled();
    }, 10000);
  });

  /* ============= */
  /*    Getters    */
  /* ============= */

  describe("Getters", () => {
    test("getSelic deve retornar valor correto", () => {
      expect(ratesManager.getSelic()).toBe(10.75);
    });

    test("getCDI deve retornar valor correto", () => {
      expect(ratesManager.getCDI()).toBe(10.5);
    });

    test("getDolar deve retornar valor correto", () => {
      expect(ratesManager.getDolar()).toBe(5.2);
    });

    test("getPoupanca deve retornar valor correto", () => {
      expect(ratesManager.getPoupanca()).toBe(0.5);
    });

    test("getIPCA deve retornar valor correto", () => {
      expect(ratesManager.getIPCA()).toBe(4.5);
    });
  });

  /* =================== */
  /*    getAllRates()    */
  /* =================== */

  describe("getAllRates", () => {
    test("deve retornar estrutura completa", () => {
      const allRates = ratesManager.getAllRates();

      expect(allRates).toHaveProperty("selic");
      expect(allRates).toHaveProperty("cdi");
      expect(allRates).toHaveProperty("ipca");
      expect(allRates).toHaveProperty("dolar");
      expect(allRates).toHaveProperty("poupanca");
      expect(allRates).toHaveProperty("formatted");

      expect(allRates.formatted).toHaveProperty("selic");
      expect(allRates.formatted).toHaveProperty("cdi");
      expect(allRates.formatted).toHaveProperty("poupanca");
      expect(allRates.formatted).toHaveProperty("dolar");
      expect(allRates.formatted).toHaveProperty("ipca");
    });

    test("deve manter consistência entre valores e formatados", () => {
      const allRates = ratesManager.getAllRates();

      expect(allRates.selic).toBe(10.75);
      expect(allRates.formatted.selic).toBe("10.75% a.a.");

      expect(allRates.cdi).toBe(10.5);
      expect(allRates.formatted.cdi).toBe("10.50% a.a.");
    });
  });
});
