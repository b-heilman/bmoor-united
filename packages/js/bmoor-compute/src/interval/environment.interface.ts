import {DatumReference, DatumSettings} from '../datum.interface';
import {DatumAccessorContext} from '../datum/accessor.interface';
import {DatumAcrossContext} from '../datum/across.interface';
import {DatumRangeContext} from '../datum/range.interface';
import {EnvironmentDatumFactory} from '../environment.interface';
import {IntervalInterface} from '../interval.interface';
import {IntervalDatumSelector, IntervalDatumInterface} from './datum.interface';

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
> extends DatumAccessorContext<DatumT>,
		DatumAcrossContext<DatumT, SelectorT>,
		DatumRangeContext<DatumT> {
	select(base: DatumT, select: SelectorT): DatumT[];

	range(datum: DatumT, range: number, strict?: boolean): DatumT[];

	offset(datum: DatumT, offset: number, strict?: boolean): DatumT;
}
