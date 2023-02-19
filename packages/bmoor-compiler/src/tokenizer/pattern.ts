import {TokenizerState} from './state';
import {Token} from './token';

export abstract class Pattern {
	abstract open(string, number): TokenizerState;
	abstract close(string, number, TokenizerState): number;
	abstract toToken(string, TokenizerState): Token;

	match(str: string, pos: number): Token {
		const state = this.open(str, pos);

		if (state) {
			let end = null;
			let pos = state.begin;

			do {
				pos++;

				end = this.close(str, pos, state);
			} while (!end && pos < str.length);

			if (end === null) {
				end = this.close(str, str.length, state);
			}

			if (end !== null) {
				state.setEnd(end);

				const token = this.toToken(str, state);

				return token;
			} else {
				// TODO: error
				throw new Error('unclosed pattern: ' + this.getReference());
			}
		} else {
			return null;
		}
	}

	getReference() {
		return this.constructor.name;
	}
}
