import {Pattern, TokenizerState} from '@bmoor/compiler';

import {QueryExpressionTokenOperation} from '../token/operation';

const isOperator = /\+|-|\*|\/|\^|\||&|=|~|<|>|!/;

export class QueryExpressionPatternOperation extends Pattern {
	// +
	open(str, pos) {
		const ch = str[pos];

		if (isOperator.test(ch)) {
			return new TokenizerState(pos);
		}

		return null;
	}

	close(str, pos) {
		const ch = str[pos];

		if (!isOperator.test(ch)) {
			return pos;
		}

		return null;
	}

	toToken(content: string, state: TokenizerState) {
		return new QueryExpressionTokenOperation(
			content,
			state,
			/*, {series}*/
		);
	}
}
