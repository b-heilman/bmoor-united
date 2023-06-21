import {DatumInterface} from '@bmoor/compute/src/datum.interface';
import {Graph} from '@bmoor/graph/src/graph';
import {Weights} from '@bmoor/graph/src/weights';

import {IntervalReference} from '../../interval.interface';

export class IntervalGraphGlobal
	implements DatumInterface<IntervalReference>
{
	interval: IntervalReference;
	weights: Weights;

	constructor(interval: IntervalReference, graph: Graph) {
		this.interval = interval;
		this.weights = graph.weights;
	}

	hasValue(attr: string): boolean {
		return this.weights.hasValue(attr);
	}

	// get the value, could be an async source
	async getValue(attr: string): Promise<number> {
		return this.weights.getValue(attr);
	}

	// set the value
	// TODO: I don't think I want to suppore mode here
	async setValue(attr: string, value: number): Promise<boolean> {
		this.weights.setValue(attr, value);

		return true;
	}
}
