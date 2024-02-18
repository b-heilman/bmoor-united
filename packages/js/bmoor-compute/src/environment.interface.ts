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

export interface EnvironmentRangeSettings {
	strict?: boolean;
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
		strict: boolean,
	): DatumInterface<NodeSelector>;

	rangeSelect(
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
		range: number,
		settings?: EnvironmentRangeSettings,
	): Map<
		IntervalInterface<IntervalRef, Order>,
		DatumInterface<NodeSelector>
	>;

	offsetInterval(
		interval: IntervalInterface<IntervalRef, Order>,
		offset: number,
	): IntervalInterface<IntervalRef, Order>;

	getPrevInterval(
		interval: IntervalInterface<IntervalRef, Order>,
	): IntervalInterface<IntervalRef, Order>;

	// Used to bootstrap the process
	getInterval(
		reference: IntervalRef,
	): IntervalInterface<IntervalRef, Order>;
}
