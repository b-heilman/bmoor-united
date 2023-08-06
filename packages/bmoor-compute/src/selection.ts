import {DatumInterface} from './datum.interface';
import {IntervalInterface} from './interval.interface';
import {SelectionInterface} from './selection.interface';

export class Selection<NodeSelector, IntervalRef, Order>
	implements SelectionInterface<NodeSelector, IntervalRef, Order>
{
	interval: IntervalInterface<IntervalRef, Order>;
	datums: DatumInterface<NodeSelector>[];

	constructor(
		interval: IntervalInterface<IntervalRef, Order>,
		datums: DatumInterface<NodeSelector>[],
	) {
		this.interval = interval;
		this.datums = datums;
	}

	filter(): Selection<NodeSelector, IntervalRef, Order> {
		return this;
	}

	unique(): Selection<NodeSelector, IntervalRef, Order> {
		return this;
	}
}
