import {Action} from './action';
import {ActionInterface, ActionReference} from './action.interface';
import {RegistryInterface} from './registry.interface';

export class Registry<NodeSelector, IntervalRef>
	implements RegistryInterface<NodeSelector, IntervalRef>
{
	definitions: Map<string, ActionInterface<NodeSelector, IntervalRef>>;

	constructor() {
		this.definitions = new Map();
	}

	addAction(
		def: Action<NodeSelector, IntervalRef>,
	): ActionInterface<NodeSelector, IntervalRef> {
		if (this.definitions.has(def.ref)) {
			throw new Error('reference already used: ' + def.ref);
		}

		this.definitions.set(def.ref, def);

		return def;
	}

	hasAction(ref: ActionReference): boolean {
		return this.definitions.has(ref);
	}

	getAction(
		ref: ActionReference,
	): ActionInterface<NodeSelector, IntervalRef> {
		return this.definitions.get(ref);
	}
}
