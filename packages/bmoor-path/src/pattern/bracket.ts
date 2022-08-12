import {Pattern, TokenizerState} from '@bmoor/compiler';

import {AccessorToken} from '../token/accessor';
import {ArrayToken} from '../token/array';

class BracketState extends TokenizerState {
	isQuote: boolean;

	constructor(begin: number, isQuote = false) {
		super(begin);

		this.isQuote = isQuote;
	}
}

export class BracketPattern extends Pattern {
	open(str: string, pos: number) {
		const ch = str[pos];

		if (ch === '[') {
			const next = str[pos + 1];

			if (next === '"') {
				return new BracketState(pos + 1, true);
			} else {
				return new BracketState(pos);
			}
		}

		return null;
	}

	close(str: string, pos: number, state: BracketState) {
		const ch = str[pos];

		if (ch === ']') {
			if (state.isQuote) {
				const prev = str[pos - 1];

				if (prev === '"') {
					state.setClose(pos - 1);

					return pos;
				}
			} else {
				state.setClose(pos);

				return pos;
			}
		}

		return null;
	}

	toToken(base: string, state: BracketState) {
		const content = base.substring(state.open + 1, state.close);

		if (state.isQuote) {
			return new AccessorToken(content, state, {
				// 	subType: this.subType
			});
		} else {
			return new ArrayToken(content, state, {
				subType: 'object'
			});
		}
	}
}
