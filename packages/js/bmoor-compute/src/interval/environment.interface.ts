import {
	DatumInterface,
	DatumReference,
	DatumSettings,
} from '../datum.interface';
import {DatumAccessorContext} from '../datum/accessor.interface';
import {DatumAcrossContext} from '../datum/across.interface';
import {DatumRangeContext} from '../datum/range.interface';
import {
	EnvironmentInterface,
	EnvironmentSelector,
} from '../environment.interface';
import {IntervalInterface} from '../interval.interface';
import {IntervalDatum} from './datum';
import {
	IntervalDatumInterface,
	IntervalDatumSelector,
} from './datum.interface';

type IntervalT = string;
type OrderT = number;

export interface IntervalEnvironmentSettings {
	content: Record<IntervalT, Record<DatumReference, DatumSettings>>;
}

export interface IntervalEnvironmentSelector
	extends IntervalDatumSelector {
	interval: IntervalInterface<IntervalT, OrderT>;
	reference: string;
}

export interface IntervalEnvironmentInterface<
	SelectorT extends IntervalEnvironmentSelector,
	DatumT extends IntervalDatumInterface,
> extends DatumAccessorContext<DatumT>,
		DatumAcrossContext<SelectorT, DatumT>,
		DatumRangeContext<DatumT> {
	select(base: DatumT, select: SelectorT): DatumT[];

	range(datum: DatumT, range: number, strict?: boolean): DatumT[];

	offset(datum: DatumT, offset: number, strict?: boolean): DatumT;

	// Used to bootstrap the process
	getInterval(reference: IntervalT): IntervalInterface<IntervalT, OrderT>;
}
