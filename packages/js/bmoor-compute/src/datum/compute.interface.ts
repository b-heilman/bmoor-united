import {DatumOffsetSettings} from './offset.interface';

export interface DatumComputeSettings<ResponseT, RequirementT, SelectT>
	extends DatumOffsetSettings<SelectT> {
	reducer: (args: RequirementT) => ResponseT;
}
