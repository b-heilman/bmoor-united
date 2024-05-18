import {IDatum} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';

export interface DatumAcrossSettings<SelectT>
	extends DatumAccessorSettings {
	select: SelectT;
}

export interface DatumAcrossContext<SelectT, DatumT extends IDatum>
	extends DatumAccessorContext<DatumT> {
	select: (datum: DatumT, select: SelectT) => DatumT[];
}
