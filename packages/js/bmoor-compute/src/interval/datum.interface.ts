import {DatumSelector, DatumSettings, IDatum} from '../datum.interface';
import {IntervalInterface} from '../interval.interface';

export interface IntervalDatumSelector extends DatumSelector {}

export interface IntervalDatumSettings extends DatumSettings {
	interval?: IntervalInterface;
}

export interface IntervalIDatum extends IDatum {
	interval: IntervalInterface;
	select(selector: IntervalDatumSelector): IDatum[];
}
