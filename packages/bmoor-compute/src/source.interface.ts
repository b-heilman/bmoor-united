import { CalculatorValue, CalculationSettings } from "./calculator.interface";

export type SourceCompute<Reference, Interval> = (
    ref: Reference,
    interval: Interval,
    method: string,
    args: CalculatorValue[],
    settings: CalculationSettings,
) => Promise<CalculatorValue>;

// common interface for a data source to be hooked back into the calculator
export interface CalculatorSourceInterface<Reference, Interval> {
    references: Reference[],
	// TODO: mounts: Map<Reference, string[]>,
	compute: SourceCompute<Reference, Interval>

    history: Interval[],
    getInterval(pos: number): Interval,
    getOffset(interval: Interval, offset: number): {interval: Interval, history: Interval[]}
}