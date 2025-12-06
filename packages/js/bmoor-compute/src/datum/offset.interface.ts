import type {DatumInterface} from '../datum.interface.ts';

export interface DatumOffsetSettings<SelectT> {
	select?: SelectT;
	offset?: number;
	strict?: boolean;
}

export interface DatumOffsetContext<
	DatumT extends DatumInterface,
	SelectT,
> {
	select: (datum: DatumT, select: SelectT) => DatumT[];
	offset: (datum: DatumT, shift: number, strict?: boolean) => DatumT;
}
