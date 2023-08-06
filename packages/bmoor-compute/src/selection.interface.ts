import {DatumInterface} from './datum.interface';
import {IntervalInterface} from './interval.interface';

export interface SelectionInterface<NodeSelector, IntervalRef, Order> {
	interval: IntervalInterface<IntervalRef, Order>;
	datums: DatumInterface<NodeSelector>[];

	filter(
		selector: NodeSelector,
	): SelectionInterface<NodeSelector, IntervalRef, Order>;

	unique(): SelectionInterface<NodeSelector, IntervalRef, Order>;
}
