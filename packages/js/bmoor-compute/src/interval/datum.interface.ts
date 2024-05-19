import {
	DatumInterface,
	DatumSelector,
	DatumSettings,
} from '../datum.interface';
import {IntervalInterface} from '../interval.interface';

export interface IntervalDatumSelector extends DatumSelector {}

export interface IntervalDatumSettings extends DatumSettings {
	interval?: IntervalInterface;
}

export interface IntervalDatumInterface extends DatumInterface {
	interval: IntervalInterface;
	select(selector: IntervalDatumSelector): DatumInterface[];
}
