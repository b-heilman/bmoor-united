import {ActionInterface, ActionReference} from './action.interface';
import {EnvironmentInterface} from './environment.interface';

export interface RegistryInterface<Interval, Selector> {
	env: EnvironmentInterface<Interval, Selector>;

	addAction(def: ActionInterface<Interval, Selector>): void;

	hasAction(feature: ActionReference): boolean;

	getAction(feature: ActionReference): ActionInterface<Interval, Selector>;

	// run a definition and pull back the value
	calculate(
		interval: Interval,
		feature: ActionReference,
		select: Selector,
	): Promise<number>;
}
