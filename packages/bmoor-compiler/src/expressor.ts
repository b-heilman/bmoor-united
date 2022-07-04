import {ExpressableToken} from './tokenizer/token';
import {Expressable, Usages} from './expressor/expressable';
import {ExecutableFunction} from './expressor/executable';
import {CompilerInterface} from './compiler.interface';

export enum Modes {
	infix = 'infix',
	postfix = 'postfix'
}

export class Expressor {
	compiler: CompilerInterface;

	constructor(compiler: CompilerInterface = null) {
		this.compiler = compiler;
	}

	toExpressables(tokens: ExpressableToken[]): Expressable[] {
		return tokens.map((token) => token.toExpressable(this.compiler));
	}

	express(tokens: ExpressableToken[], mode: Modes): Expressable[] {
		const infix: Expressable[] = this.toExpressables(tokens);

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

	makeExecutable(tokens: ExpressableToken[]): ExecutableFunction {
		return this.express(tokens, Modes.postfix).reduce((stack, exp) => {
			if (exp.usage === Usages.value) {
				stack.push(exp.prepare());
			} else {
				const right = stack.pop();
				const left = stack.pop();

				stack.push(function preparedBlock(ctx) {
					return exp.eval(left(ctx), right(ctx));
				});
			}

			return stack;
		}, [])[0];
	}
}
