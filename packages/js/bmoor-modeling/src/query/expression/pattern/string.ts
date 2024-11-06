import {Pattern, TokenizerState} from '@bmoor/compiler';

import {QueryExpressionTokenConstant} from '../token/constant';

const isQuote = /"|'|`/;
const escapeChar = '\\';

export class QueryExpressionPatternString extends Pattern {
	// (...)
	open(str, pos) {
		const ch = str[pos];
		const last = str[pos - 1];

		if (last !== escapeChar && isQuote.test(ch)) {
			const state = new TokenizerState(pos);

			state.setVariable('quote', ch);

			return state;
		}

		return null;
	}

	close(str, pos, state: TokenizerState) {
		const ch = str[pos];
		const last = str[pos - 1];
		const quote = state.getVariable('quote');

		if (ch === quote && last !== escapeChar) {
			return pos;
		}

		return null;
	}

	toToken(content: string, state: TokenizerState) {
		content = content.substring(1, content.length - 1);
		const quote = <string>state.getVariable('quote');

		const escape =
			escapeChar === '\\' ? '\\\\' + quote : escapeChar + quote;

		const value = content.replace(new RegExp(escape, 'g'), quote);

		return new QueryExpressionTokenConstant(
			value,
			state,
			/*, {series}*/
		);
	}
}
