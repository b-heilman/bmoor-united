import {
	ActionFeature,
	ActionInterface,
	ActionReference,
} from './action.interface';
import {DatumInterface} from './datum.interface';
import {EnvironmentInterface} from './environment.interface';
import {RegistryInterface} from './registry.interface';

export abstract class Action<Interval, Selector>
	implements ActionInterface<Interval, Selector>
{
	ref: ActionReference;
	env: EnvironmentInterface<Interval, Selector>;
	reg: RegistryInterface<Interval, Selector>;

	constructor(ref: ActionReference) {
		this.ref = ref;
	}

	setRegistry(registry: RegistryInterface<Interval, Selector>): void {
		this.reg = registry;
	}

	setEnvironment(env: EnvironmentInterface<Interval, Selector>): void {
		this.env = env;
	}

	getRequirements(): Action<Interval, Selector>[] {
		return [];
	}

	async readFeature(
		datum: DatumInterface<Interval>,
		feature: ActionFeature<Interval, Selector>,
	): Promise<number> {
		if (feature instanceof Action) {
			return feature.execute(datum);
		} else {
			return datum.getValue(<string>feature);
		}
	}

	abstract eval(datum: DatumInterface<Interval>): Promise<number>;

	async execute(datum: DatumInterface<Interval>): Promise<number> {
		if (datum.hasValue(this.ref)) {
			return datum.getValue(this.ref);
		} else {
			// TODO: I might want to add a prepare here
			const value = await this.eval(datum);

			datum.setValue(this.ref, value);

			return value;
		}
	}
}
