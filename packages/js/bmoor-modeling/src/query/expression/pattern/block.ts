import {Pattern, TokenizerState} from '@bmoor/compiler';

import {QueryExpressionTokenBlock} from '../token/block';
import {QueryExpressionTokenConstant} from '../token/constant';

export class QueryExpressionPatternBlock extends Pattern {
	// (...)
	open(str, pos) {
		const ch = str[pos];

		if (ch === '(') {
			const state = new TokenizerState(pos + 1);

			state.setVariable('count', 1);
			state.setVariable('char', '(');
			state.setVariable('end', ')');

			return state;
		} else if (ch === '[') {
			const state = new TokenizerState(pos + 1);

			state.setVariable('count', 1);
			state.setVariable('char', '[');
			state.setVariable('end', ']');

			return state;
		}

		return null;
	}

	close(str, pos, state: TokenizerState) {
		const ch = str[pos];
		const char = state.getVariable('char');
		const end = state.getVariable('end');

		let count = <number>state.getVariable('count');

		if (ch === char) {
			state.setVariable('count', count + 1);
		} else if (ch === end) {
			count--;

			if (count === 0) {
				return pos - 1;
			} else {
				state.setVariable('count', count);
			}
		}

		return null;
	}

	toToken(content: string, state: TokenizerState) {
		if (state.getVariable('char') === '(') {
			return new QueryExpressionTokenBlock(
				content,
				state,
				/*, {series}*/
			);
		} else {
			const value = JSON.parse(content);

			return new QueryExpressionTokenConstant(
				value,
				state,
				/*, {series}*/
			);
		}
	}
}
