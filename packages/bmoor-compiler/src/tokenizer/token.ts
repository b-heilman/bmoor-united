import {Expressable} from '../expression/expressable';

import {TokenizerState} from './state';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type TokenValue = any;

export interface TokenSettings {
	subType: string;
}

export abstract class Token {
	abstract toExpressable(): Expressable[];

	type: string;
	state: TokenizerState;
	content: TokenValue;
	settings: TokenSettings;

	constructor(
		type: string,
		content: TokenValue,
		state: TokenizerState,
		settings: TokenSettings = null
	) {
		this.type = type;
		this.state = state;
		this.content = content;
		this.settings = settings;
	}

	getNextPosition() {
		return this.state.end + 1;
	}

	getReference() {
		return this.type;
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
