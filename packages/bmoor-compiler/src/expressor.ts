import {Token} from './tokenizer/token';
import {Expressable, Usages} from './expression/expressable';

export enum Modes {
	infix = new Symbol('infix'),
	postfix = new Symbol('postfix')
}

export class Expressor {
	// TODO: is there something needed for the constructor?

	express(tokens: Token[], mode: Modes) {
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
}
