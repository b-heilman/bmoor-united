import {ExpressorExpressSettings} from '@bmoor/compiler';

export enum ParserModes {
	read = 'read',
	write = 'write',
}

export interface ParserSettings extends ExpressorExpressSettings {
	mode: ParserModes;
}
