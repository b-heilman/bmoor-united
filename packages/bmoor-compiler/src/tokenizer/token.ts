import {Expressable} from '../expressor/expressable';
import {CompilerInterface} from '../compiler.interface';
import {TokenizerState} from './state';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type TokenValue = any;

export type TokenReference = string;

export interface TokenSettings {
	subType: string;
}

export interface ExpressableToken {
	toExpressable(compiler?: CompilerInterface): Expressable[];
	getReference(): string;
}

export type TokenConstructor = {
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	new (..._: any): Token;
	reference: TokenReference;
};

export abstract class Token implements ExpressableToken {
	abstract toExpressable(compiler?: CompilerInterface): Expressable[];

	type: string;
	state: TokenizerState;
	content: TokenValue;
	settings: TokenSettings;

	static reference: TokenReference = 'not-defined';

	constructor(
		content: TokenValue,
		state: TokenizerState,
		settings: TokenSettings = null
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
			settings: this.settings
		};
	}
}
