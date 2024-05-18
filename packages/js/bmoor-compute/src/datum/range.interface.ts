import {IDatum} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';

export interface DatumRangeSettings extends DatumAccessorSettings {
	range: number;
	strict: boolean;
}

export interface DatumRangeContext<DatumT extends IDatum>
	extends DatumAccessorContext<DatumT> {
	range: (datum: DatumT, depth: number, strict: boolean) => DatumT[];
}
