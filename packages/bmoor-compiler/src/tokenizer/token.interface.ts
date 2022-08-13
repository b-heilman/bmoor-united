import {Expressable} from '../expressor/expressable';
import {ExpressorExpressSettings} from '../expressor.interface';
import {CompilerInterface} from '../compiler.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type TokenValue = any;

export type TokenReference = string;

export interface TokenSettings {
	subType?: string;
}

export interface ExpressableToken {
	content: TokenValue;

	toExpressable(
		compiler?: CompilerInterface,
		settings?: ExpressorExpressSettings
	): Expressable;
	getReference(): string;
}
