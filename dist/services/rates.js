"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const https = __importStar(require("https"));
class RatesManager {
    constructor() {
        this.rates = {
            selic: 10.75,
            cdi: 10.5,
            ipca: 4.5,
            dolar: 5.2,
            poupanca: 0.5,
        };
    }
    async updateAll() {
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
        }
        catch (error) {
            return this.rates;
        }
    }
    async fetchSelic() {
        return new Promise((resolve) => {
            const options = {
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
                        const json = JSON.parse(data);
                        const valor = parseFloat(json[0]?.valor);
                        resolve(valor || null);
                    }
                    catch {
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
    async fetchDolar() {
        return new Promise((resolve) => {
            const options = {
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
                        const json = JSON.parse(data);
                        const valor = json.rates?.BRL;
                        resolve(valor || null);
                    }
                    catch {
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
    updateSavingsRule() {
        if (this.rates.selic <= 8.5) {
            this.rates.poupanca = (this.rates.selic / 12) * 0.7;
        }
        else {
            this.rates.poupanca = 0.5;
        }
    }
    getSelic() {
        return this.rates.selic;
    }
    getCDI() {
        return this.rates.cdi;
    }
    getDolar() {
        return this.rates.dolar;
    }
    getPoupanca() {
        return this.rates.poupanca;
    }
    getIPCA() {
        return this.rates.ipca;
    }
    getAllRates() {
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
exports.default = RatesManager;
