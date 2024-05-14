import {IDatum} from '../datum.interface';

export interface DatumAccessorSettings {
	offset: number;
	strict?: boolean;
}

export interface DatumAccessorContext {
	offset: (datum: IDatum, shift: number, strict: boolean) => IDatum;
}
