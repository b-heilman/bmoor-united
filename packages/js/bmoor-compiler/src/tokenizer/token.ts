import type {CompilerInterface} from '../compiler.interface.ts';
import type {ExpressorExpressSettings} from '../expressor.interface.ts';
import {Expressable} from '../expressor/expressable.ts';
import {TokenizerState} from './state.ts';
import type {
	ExpressableToken,
	TokenReference,
	TokenSettings,
	TokenValue,
} from './token.interface.ts';

export type TokenConstructor = {
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	new (..._: any): Token;
	reference: TokenReference;
};
export abstract class Token implements ExpressableToken {
	abstract toExpressable(
		compiler?: CompilerInterface,
		settings?: ExpressorExpressSettings,
	): Expressable;

	type: string;
	state: TokenizerState;
	content: TokenValue;
	settings: TokenSettings;

	static reference: TokenReference = 'not-defined';

	constructor(
		content: TokenValue,
		state: TokenizerState,
		settings: TokenSettings = null,
	) {
		this.state = state;
		this.content = content;
		this.settings = settings;
	}

	getNextPosition() {
		return this.state.end + 1;
	}

	getReference() {
		return (<TokenConstructor>this.constructor).reference;
	}

	// TODO: assign(incoming: TokenInterface)

	toJSON() {
		return {
			reference: this.getReference(),
			content: this.content,
			settings: this.settings,
		};
	}
}
