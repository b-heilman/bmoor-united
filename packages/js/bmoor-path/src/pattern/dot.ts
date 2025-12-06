import {Pattern, TokenizerState} from '@bmoor/compiler';

import {AccessorToken} from '../token/accessor.ts';

const isVariable = /[A-Za-z_0-9]/;

export class DotPattern extends Pattern {
	open(str: string, pos: number) {
		const ch = str[pos];

		if (isVariable.test(ch)) {
			return new TokenizerState(pos);
		}

		return null;
	}

	close(str: string, pos: number) {
		if (pos >= str.length) {
			return pos;
		} else {
			const ch = str[pos];

			if (!isVariable.test(ch)) {
				return pos - 1;
			}
		}

		return null;
	}

	toToken(base: string, state: TokenizerState) {
		return new AccessorToken(
			base.substring(state.open, state.close + 1),
			state,
			{
				//	subType: this.subType
			},
		);
	}
}
