import {ExpressableToken} from './tokenizer/token';
import {
	Expressable,
	Usages,
	ExpressableFunction
} from './expressor/expressable';

export enum Modes {
	infix = 'infix',
	postfix = 'postfix'
}

export class Expressor {
	// TODO: is there something needed for the constructor?

	express(tokens: ExpressableToken[], mode: Modes): Expressable[] {
		const infix: Expressable[] = tokens.flatMap((token) =>
			token.toExpressable()
		);

		if (mode === Modes.infix) {
			return infix;
		} else {
			const processed = infix.reduce(
				(state, exp) => {
					if (exp.usage === Usages.operation) {
						while (state.ops.length && exp.rank >= state.ops[0].rank) {
							state.postfix.push(state.ops.shift());
						}

						state.ops.unshift(exp);
					} else {
						state.postfix.push(exp);
					}

					return state;
				},
				{postfix: [], ops: []}
			);

			return processed.ops.reduce((agg, op) => {
				agg.push(op);

				return agg;
			}, processed.postfix);
		}
	}

	makeExecutable(tokens: ExpressableToken[]): ExpressableFunction {
		return this.express(tokens, Modes.postfix).reduce((stack, exp) => {
			if (exp.usage === Usages.value) {
				stack.push(exp.prepare());
			} else {
				const right = stack.pop();
				const left = stack.pop();

				stack.push(function preparedBlock(obj) {
					return exp.eval(left, right, obj);
				});
			}

			return stack;
		}, [])[0];
	}
}
