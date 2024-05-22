import {DatumAccessorSettings} from './accessor.interface';

export interface DatumComputeSettings<ResponseT, RequirementT>
	extends DatumAccessorSettings {
	reducer: (args: RequirementT) => ResponseT;
}
