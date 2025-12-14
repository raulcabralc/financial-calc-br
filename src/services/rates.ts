import * as https from "https";

import {
  Rates,
  SelicApiResponse,
  DolarApiResponse,
  AllRates,
} from "../types/types";

class RatesManager {
  private rates: Rates;

  constructor() {
    this.rates = {
      selic: 10.75,
      cdi: 10.5,
      ipca: 4.5,
      dolar: 5.2,
      poupanca: 0.5,
    };
  }

  static async create(): Promise<RatesManager> {
    const rates = new RatesManager();
    await rates.updateAll();
    return rates;
  }

  async updateAll(): Promise<Rates> {
    try {
      const selic = await this.fetchSelic();
      if (selic) {
        this.rates.selic = selic;
      }

      this.rates.cdi = this.rates.selic * 0.9;

      const dolar = await this.fetchDolar();
      if (dolar) {
        this.rates.dolar = dolar;
      }

      this.updateSavingsRule();

      return this.rates;
    } catch (error) {
      return this.rates;
    }
  }

  private async fetchSelic(): Promise<number | null> {
    return new Promise((resolve) => {
      const options: https.RequestOptions = {
        hostname: "api.bcb.gov.br",
        path: "/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json",
        method: "GET",
        timeout: 5000,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json: SelicApiResponse[] = JSON.parse(data);
            const valor = parseFloat(json[0]?.valor);
            resolve(valor || null);
          } catch {
            resolve(null);
          }
        });
      });

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    });
  }

  private async fetchDolar(): Promise<number | null> {
    return new Promise((resolve) => {
      const options: https.RequestOptions = {
        hostname: "api.exchangerate-api.com",
        path: "/v4/latest/USD",
        method: "GET",
        timeout: 5000,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json: DolarApiResponse = JSON.parse(data);
            const valor = json.rates?.BRL;
            resolve(valor || null);
          } catch {
            resolve(null);
          }
        });
      });

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    });
  }

  private updateSavingsRule(): void {
    if (this.rates.selic <= 8.5) {
      this.rates.poupanca = (this.rates.selic * 0.7) / 12;
    } else {
      this.rates.poupanca = 0.5;
    }
  }

  getSelic(): number {
    return this.rates.selic;
  }

  getCDI(): number {
    return this.rates.cdi;
  }

  getDolar(): number {
    return this.rates.dolar;
  }

  getPoupanca(): number {
    return this.rates.poupanca;
  }

  getIPCA(): number {
    return this.rates.ipca;
  }

  getAllRates(): AllRates {
    return {
      ...this.rates,
      formatted: {
        selic: `${this.rates.selic}% a.a.`,
        cdi: `${this.rates.cdi.toFixed(2)}% a.a.`,
        poupanca: `${this.rates.poupanca.toFixed(2)}% a.m.`,
        dolar: `R$ ${this.rates.dolar.toFixed(2)}`,
        ipca: `${this.rates.ipca}% a.a.`,
      },
    };
  }
}

export default RatesManager;
