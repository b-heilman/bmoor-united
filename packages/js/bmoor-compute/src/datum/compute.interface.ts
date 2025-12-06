import type {DatumOffsetSettings} from './offset.interface.ts';

export interface DatumComputeSettings<
	ResponseT,
	RequirementT,
	SelectT,
> extends DatumOffsetSettings<SelectT> {
	reducer: (args: RequirementT) => ResponseT;
}
