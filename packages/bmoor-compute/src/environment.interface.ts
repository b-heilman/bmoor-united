import {DatumInterface} from './datum.interface';

// interface which allows local methods to be defined
export interface EnvironmentInterface<Interval, Selector> {
	select(interval: Interval, select: Selector): DatumInterface<Interval>[];

	subSelect(
		datum: DatumInterface<Interval>,
		interval: Interval,
		select: Selector,
	): DatumInterface<Interval>[];

	intervalSelect(
		datum: DatumInterface<Interval>,
		interval: Interval,
	): DatumInterface<Interval>;

	rangeSelect(
		datum: DatumInterface<Interval>,
		interval: Interval,
		range: number,
	): DatumInterface<Interval>[];

	getGlobal(interval: Interval): DatumInterface<Interval>;

	getSelfSelector(datum: DatumInterface<Interval>);

	overrideSelector(select: Selector, override: Selector): Selector;

	offsetInterval(interval: Interval, offset: number): Interval;
}
