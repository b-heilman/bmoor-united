import {
	CalculationSettings,
	CalculatorValue,
} from './calculator.interface';

export type EnvironmentMethodsInterface = Record<
	string,
	(
		args: CalculatorValue[],
		settings: CalculationSettings,
	) => Promise<CalculatorValue>
>;
// interface which allows local methods to be defined
export interface EnvironmentInterface<Reference, Interval> {
	getValue: (
		ref: Reference,
		i: Interval,
		mount: string,
	) => CalculatorValue;
	setValue: (
		ref: Reference,
		i: Interval,
		mount: string,
		value: CalculatorValue,
	) => void;
	hasValue: (ref: Reference, i: Interval, mount: string) => boolean;
	canCompute(method: string): boolean;
	compute: (
		method: string,
		args: CalculatorValue[],
		settings: CalculationSettings,
	) => Promise<CalculatorValue>;
}
