import { creditCardPaga, creditCard } from "../types/types";
declare class creditCardCalc {
    calcRotativo(valorFatura: number, valorPago: number, taxaMensal?: number): creditCard | creditCardPaga;
}
export default creditCardCalc;
