import {DatumInterface} from '@bmoor/compute/src/datum.interface';
import {Node} from '@bmoor/graph/src/node';
import {
	NodeReference,
	NodeValueSelector,
} from '@bmoor/graph/src/node.interface';

import {IntervalReference} from '../../interval.interface';

export class IntervalGraphDatum
	implements DatumInterface<IntervalReference>
{
	ref: NodeReference;
	mode: NodeValueSelector;
	node: Node;
	interval: IntervalReference;

	constructor(
		interval: IntervalReference,
		node: Node,
		mode: NodeValueSelector,
	) {
		this.ref = node.ref;
		this.mode = mode;
		this.node = node;
		this.interval = interval;
	}

	hasValue(attr: string): boolean {
		return this.node.hasValue(attr, this.mode);
	}

	// get the value, could be an async source
	async getValue(attr: string): Promise<number> {
		return this.node.getValue(attr, this.mode);
	}

	// set the value
	// TODO: I don't think I want to suppore mode here
	async setValue(attr: string, value: number): Promise<boolean> {
		this.node.setWeight(attr, value);

		return true;
	}
}
