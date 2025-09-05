import {
	DatumInterface,
	DatumSelector,
	DatumSettings,
} from '../datum.interface.ts';
import {IntervalInterface} from '../interval.interface.ts';

export interface IntervalDatumSelector extends DatumSelector {
	interval?: IntervalInterface;
}

export interface IntervalDatumSettings extends DatumSettings {
	interval?: IntervalInterface;
}

export interface IntervalDatumInterface
	extends DatumInterface<IntervalDatumSelector> {
	interval: IntervalInterface;
	select(selector: IntervalDatumSelector): IntervalDatumInterface[];
}
