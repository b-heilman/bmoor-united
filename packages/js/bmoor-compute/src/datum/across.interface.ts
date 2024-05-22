import {DatumInterface} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';

export interface DatumAcrossSettings<ResponseT, RequirementT, SelectT>
	extends DatumAccessorSettings {
	select: SelectT;
	reducer: (args: RequirementT[]) => ResponseT;
}

export interface DatumAcrossContext<DatumT extends DatumInterface, SelectT>
	extends DatumAccessorContext<DatumT> {
	select: (datum: DatumT, select: SelectT) => DatumT[];
}
