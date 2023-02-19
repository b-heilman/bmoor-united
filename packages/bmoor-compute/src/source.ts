import { CalculatorValue, CalculationSettings } from "./calculator.interface";
import { CalculatorSourceInterface, SourceCompute } from "./source.interface";

export class Source<Reference, Interval> implements CalculatorSourceInterface<Reference, Interval> {
    history: Interval[];
    references: Reference[];
    compute: SourceCompute<Reference, Interval>;

    constructor(
        history: Interval[], // expected: past => current
        references: Reference[], 
        compute: (
            ref: Reference,
            interval: Interval,
            method: string,
            args: CalculatorValue[],
            settings: CalculationSettings,
        ) => Promise<CalculatorValue>
    ){
        this.history = history.reverse();
        this.references = references;
        this.compute = compute;
    }

    getInterval(pos: number): Interval {
        return this.history[this.history.length - pos - 1];
    }

    getOffset(interval: Interval, offset: number): {interval: Interval, history: Interval[]} {
        const pos = this.history.indexOf(interval) + offset;
        const offsetInterval = this.history[pos];
        
        return {
            interval: offsetInterval,
            history: this.history.slice(pos+1)
        };
    }
}