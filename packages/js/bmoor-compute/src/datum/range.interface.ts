import {IDatum} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';

export interface DatumRangeSettings extends DatumAccessorSettings {
	range: number;
}

export interface DatumRangeContext extends DatumAccessorContext {
	range: (datum: IDatum, depth: number) => IDatum[];
}
