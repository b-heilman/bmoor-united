import {DatumInterface, FeatureReference} from './datum.interface';
import {EnvironmentInterface} from './environment.interface';
import {RegistryInterface} from './registry.interface';

export type ActionReference = string;

export type ActionFeature<Interval, Selector> =
	| FeatureReference
	| ActionInterface<Interval, Selector>;

// common interface for a data source to be hooked back into the calculator
export interface ActionInterface<Interval, Selector> {
	env: EnvironmentInterface<Interval, Selector>;
	reg: RegistryInterface<Interval, Selector>;

	setEnvironment(env: EnvironmentInterface<Interval, Selector>): void;
	setRegistry(registry: RegistryInterface<Interval, Selector>): void;

	readFeature(
		datum: DatumInterface<Interval>,
		feature: ActionFeature<Interval, Selector>,
	): Promise<number>;

	execute(
		datum: DatumInterface<Interval>,
		interval: Interval,
	): Promise<number>;
}
