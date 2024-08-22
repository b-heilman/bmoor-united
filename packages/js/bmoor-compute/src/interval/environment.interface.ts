import {DatumReference, DatumSettings} from '../datum.interface';
import {DatumAcrossContext} from '../datum/across.interface';
import {DatumOffsetContext} from '../datum/offset.interface';
import {DatumRangeContext} from '../datum/range.interface';
import {EnvironmentDatumFactory} from '../environment.interface';
import {IntervalInterface} from '../interval.interface';
import {
	IntervalDatumInterface,
	IntervalDatumSelector,
} from './datum.interface';

type IntervalT = string;
type OrderT = number;

export interface IntervalEnvironmentSettings<
	DatumT extends IntervalDatumInterface,
	SettingsT extends DatumSettings,
> {
	factory: (
		interval: IntervalInterface<IntervalT, OrderT>,
	) => EnvironmentDatumFactory<DatumT, SettingsT>;
	content: Record<IntervalT, Record<DatumReference, SettingsT>>;
}

export interface IntervalEnvironmentSelector
	extends IntervalDatumSelector {
	reference?: string;
}

// TODO: Move these two two interfaces... and coencide with the interfaces
//   needed for the datum actions
export interface IntervalEnvironmentInterface<
	DatumT extends IntervalDatumInterface,
	SelectorT extends IntervalEnvironmentSelector,
> extends DatumOffsetContext<DatumT, SelectorT>,
		DatumAcrossContext<DatumT, SelectorT>,
		DatumRangeContext<DatumT, SelectorT> {
	select(base: DatumT, select: SelectorT): DatumT[];

	range(datum: DatumT, range: number, strict?: boolean): DatumT[];

	offset(datum: DatumT, offset: number, strict?: boolean): DatumT;
}
