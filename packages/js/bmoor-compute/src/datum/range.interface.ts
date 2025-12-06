import type {DatumInterface} from '../datum.interface.ts';
import type {
	DatumOffsetContext,
	DatumOffsetSettings,
} from './offset.interface.ts';

export interface DatumRangeSettings<
	ResponseT,
	RequirementT,
	SelectT,
> extends DatumOffsetSettings<SelectT> {
	range: number;
	strict?: boolean;
	reducer: (args: RequirementT[]) => ResponseT;
}

export interface DatumRangeContext<
	DatumT extends DatumInterface,
	SelectT,
> extends DatumOffsetContext<DatumT, SelectT> {
	range: (datum: DatumT, depth: number, strict: boolean) => DatumT[];
}
