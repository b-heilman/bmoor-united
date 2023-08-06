import {SelectionInterface} from '@bmoor/compute';
import {GraphSelection, NodeSelector} from '@bmoor/graph';

import {Interval} from '../interval';
import {IntervalOrder, IntervalReference} from '../interval.interface';

export class DimensionalGraphSelection
	extends GraphSelection
	implements
		SelectionInterface<NodeSelector, IntervalReference, IntervalOrder>
{
	interval: Interval;

	constructor(selection: GraphSelection, interval: Interval) {
		super(selection.selector, selection.datums);

		this.interval = interval;
	}

	filter(select: NodeSelector): DimensionalGraphSelection {
		const rtn = super.filter(select);

		return new DimensionalGraphSelection(rtn, this.interval);
	}

	unique(): DimensionalGraphSelection {
		return new DimensionalGraphSelection(
			new GraphSelection(this.selector, Array.from(new Set(this.datums))),
			this.interval,
		);
	}
}
