import {DatumInterface} from '../datum.interface';

export interface DatumAccessorSettings {
	offset: number;
	strict?: boolean;
}

export interface DatumAccessorContext<DatumT extends DatumInterface> {
	offset: (datum: DatumT, shift: number, strict?: boolean) => DatumT;
}
