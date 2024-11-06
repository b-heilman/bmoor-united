import {Pattern, TokenizerState} from '@bmoor/compiler';

import {QueryExpressionTokenReference} from '../token/reference';

export const isVariable = /[A-Za-z_0-9]/;

export class QueryExpressionPatternReference extends Pattern {
	// $foo, $bar
	open(str, pos) {
		if (str[pos] === '$') {
			return new TokenizerState(pos + 1);
		}

		return null;
	}

	close(master, pos, state: TokenizerState) {
		const ch = master[pos];

		if (isVariable.test(ch)) {
			return null;
		}

		if (ch === ':') {
			state.setVariable('series', true);
			return null;
		}

		return pos - 1;
	}

	toToken(content: string, state: TokenizerState) {
		let model = content;

		if (state.getVariable('series')) {
			model = content.split(':')[1];
		}

		return new QueryExpressionTokenReference(
			model,
			state,
			/*, {series}*/
		);
	}
}
