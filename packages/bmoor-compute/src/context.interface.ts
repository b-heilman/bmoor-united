import {CalculatorSourceInterface} from './calculator.interface';
import {EnvironmentInterface} from './environment.interface';

export interface ContextInterface<Reference, Interval> {
	src: CalculatorSourceInterface<Reference, Interval>;
	env: EnvironmentInterface<Reference, Interval>;
}
