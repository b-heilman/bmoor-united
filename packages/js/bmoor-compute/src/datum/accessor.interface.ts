import {IDatum} from '../datum.interface';

export interface DatumAccessorSettings {
	offset: number;
	strict?: boolean;
}

export interface DatumAccessorContext<DatumT extends IDatum> {
	offset: (datum: DatumT, shift: number, strict?: boolean) => DatumT;
}
