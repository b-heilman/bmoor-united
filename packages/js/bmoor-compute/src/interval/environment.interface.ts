import type {DatumReference, DatumSettings} from '../datum.interface.ts';
import type {DatumAcrossContext} from '../datum/across.interface.ts';
import type {DatumOffsetContext} from '../datum/offset.interface.ts';
import type {DatumRangeContext} from '../datum/range.interface.ts';
import type {EnvironmentDatumFactory} from '../environment.interface.ts';
import type {IntervalInterface} from '../interval.interface.ts';
import type {
	IntervalDatumInterface,
	IntervalDatumSelector,
} from './datum.interface.ts';

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

export interface IntervalEnvironmentSelector extends IntervalDatumSelector {
	reference?: string;
}

// TODO: Move these two two interfaces... and coencide with the interfaces
//   needed for the datum actions
export interface IntervalEnvironmentInterface<
	DatumT extends IntervalDatumInterface,
	SelectorT extends IntervalEnvironmentSelector,
>
	extends
		DatumOffsetContext<DatumT, SelectorT>,
		DatumAcrossContext<DatumT, SelectorT>,
		DatumRangeContext<DatumT, SelectorT> {
	select(base: DatumT, select: SelectorT): DatumT[];

	range(datum: DatumT, range: number, strict?: boolean): DatumT[];

	offset(datum: DatumT, offset: number, strict?: boolean): DatumT;
}
