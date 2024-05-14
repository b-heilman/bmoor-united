import {IDatum} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';

export interface DatumAcrossSettings<SelectT>
	extends DatumAccessorSettings {
	select: SelectT;
}

export interface DatumAcrossContext<SelectT> extends DatumAccessorContext {
	select: (datum: IDatum, select: SelectT) => IDatum[];
}
