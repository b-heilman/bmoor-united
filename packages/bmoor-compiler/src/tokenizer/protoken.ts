import {Token} from './token';
import {TokenizerState} from './state';

export abstract class Protoken {
	abstract getReference(): string;
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

			if (end) {
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
}
