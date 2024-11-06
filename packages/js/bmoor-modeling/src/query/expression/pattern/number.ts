import {Pattern, TokenizerState} from '@bmoor/compiler';

import {QueryExpressionTokenConstant} from '../token/constant';

const isDigit = /\d/;

export class QueryExpressionPatternNumber extends Pattern {
	// (...)
	open(str, pos) {
		const ch = str[pos];

		if (isDigit.test(ch)) {
			return new TokenizerState(pos);
		}

		return null;
	}

	close(str, pos, state: TokenizerState) {
		const ch = str[pos];

		if (isDigit.test(ch)) {
			return null;
		}

		if (ch === '.') {
			state.setVariable('isFloat', true);
			return null;
		}

		return pos;
	}

	toToken(content: string, state: TokenizerState) {
		const value = state.getVariable('isFloat')
			? parseFloat(content)
			: parseInt(content);

		return new QueryExpressionTokenConstant(
			value,
			state,
			/*, {series}*/
		);
	}
}
