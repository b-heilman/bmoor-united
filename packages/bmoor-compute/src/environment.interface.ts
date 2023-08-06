import {DatumInterface} from './datum.interface';
import {IntervalInterface} from './interval.interface';
import {SelectionInterface} from './selection.interface';

// interface which allows local methods to be defined
export interface EnvironmentInterface<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
> {
	select(
		interval: IntervalInterface<IntervalRef, Order>,
		select: GraphSelector,
	): SelectionInterface<NodeSelector, IntervalRef, Order>;

	getGlobal(
		interval: IntervalInterface<IntervalRef, Order>,
	): DatumInterface<NodeSelector>;

	intervalSelect(
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
	): DatumInterface<NodeSelector>;

	rangeSelect(
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
		range: number,
	): Map<
		IntervalInterface<IntervalRef, Order>,
		DatumInterface<NodeSelector>
	>;

	overrideSelector(
		select: GraphSelector,
		override: GraphSelector,
	): GraphSelector;

	offsetInterval(
		interval: IntervalInterface<IntervalRef, Order>,
		offset: number,
	): IntervalInterface<IntervalRef, Order>;
}
