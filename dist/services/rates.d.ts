import { Rates, AllRates } from "../types/types";
declare class RatesManager {
    private rates;
    constructor();
    updateAll(): Promise<Rates>;
    private fetchSelic;
    private fetchDolar;
    private updateSavingsRule;
    getSelic(): number;
    getCDI(): number;
    getDolar(): number;
    getPoupanca(): number;
    getIPCA(): number;
    getAllRates(): AllRates;
}
export default RatesManager;
