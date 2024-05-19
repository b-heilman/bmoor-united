import {IDatum} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';

export interface DatumAcrossSettings<RequirementT, ResponseT, SelectT>
	extends DatumAccessorSettings {
	select: SelectT;
	reducer: (args: RequirementT[]) => ResponseT;
}

export interface DatumAcrossContext<DatumT extends IDatum, SelectT>
	extends DatumAccessorContext<DatumT> {
	select: (datum: DatumT, select: SelectT) => DatumT[];
}
