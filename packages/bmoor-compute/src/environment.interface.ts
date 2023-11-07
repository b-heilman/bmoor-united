import {
	DatumInterface,
	DatumReference,
	DatumSelector,
	DatumSettings,
} from './datum.interface';
import {IntervalInterface} from './interval.interface';

export type EnvironmentSettings = Record<
	string,
	Record<DatumReference, DatumSettings>
>;

export interface EnvironmentSelector extends DatumSelector {
	reference: string;
}

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
	): DatumInterface<NodeSelector>[];

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

	offsetInterval(
		interval: IntervalInterface<IntervalRef, Order>,
		offset: number,
	): IntervalInterface<IntervalRef, Order>;

	getInterval(
		reference: IntervalRef,
	): IntervalInterface<IntervalRef, Order>;
}
