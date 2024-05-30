import {DatumInterface} from '../datum.interface';
import {DatumOffsetContext, DatumOffsetSettings} from './offset.interface';

export interface DatumAcrossSettings<ResponseT, RequirementT, SelectT>
	extends DatumOffsetSettings<SelectT> {
	reducer: (args: RequirementT[]) => ResponseT;
}

export interface DatumAcrossContext<DatumT extends DatumInterface, SelectT>
	extends DatumOffsetContext<DatumT, SelectT> {
	select: (datum: DatumT, select: SelectT) => DatumT[];
}
