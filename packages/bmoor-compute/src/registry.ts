import {Action} from './action';
import {ActionInterface, ActionReference} from './action.interface';
import {EnvironmentInterface} from './environment.interface';
import {RegistryInterface} from './registry.interface';

export class Registry<Interval, Selector>
	implements RegistryInterface<Interval, Selector>
{
	env: EnvironmentInterface<Interval, Selector>;
	definitions: Map<string, ActionInterface<Interval, Selector>>;

	constructor(env: EnvironmentInterface<Interval, Selector>) {
		this.env = env;
		this.definitions = new Map();
	}

	addAction(
		def: Action<Interval, Selector>,
	): ActionInterface<Interval, Selector> {
		def.setEnvironment(this.env);
		def.setRegistry(this);

		if (this.definitions.has(def.ref)) {
			throw new Error('reference already used: ' + def.ref);
		}

		this.definitions.set(def.ref, def);

		const requirements = def.getRequirements();
		for (const req of requirements) {
			if (!this.definitions.has(req.ref)) {
				this.addAction(req);
			}
		}

		return def;
	}

	hasAction(ref: ActionReference): boolean {
		return this.definitions.has(ref);
	}

	getAction(ref: ActionReference): ActionInterface<Interval, Selector> {
		return this.definitions.get(ref);
	}

	// run a definition and pull back the value
	async calculate(
		interval: Interval,
		ref: ActionReference,
		select: Selector,
	): Promise<number> {
		const def = this.getAction(ref);
		const datums = this.env.select(interval, select);

		if (datums.length > 1) {
			throw new Error('too many node selected');
		} else {
			return def.execute(datums[0], interval);
		}
	}
}
