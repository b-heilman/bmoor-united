import {ExpressorExpressSettings} from '@bmoor/compiler';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ParserHook = (any) => any;

export enum ParserModes {
	read = 'read',
	write = 'write',
}

export interface ParserSettings extends ExpressorExpressSettings {
	mode: ParserModes;
	hook?: ParserHook;
}
