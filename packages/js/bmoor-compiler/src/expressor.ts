import {CompilerInterface} from './compiler.interface';
import {
	ExpressorExpressPosition,
	ExpressorExpressSettings,
} from './expressor.interface';
import {ExecutableFunction} from './expressor/executable';
import {Expressable} from './expressor/expressable';
import {ExpressableUsages} from './expressor/expressable.interface';
import {ExpressableToken} from './tokenizer/token.interface';

export enum ExpressorModes {
	infix = 'infix',
	postfix = 'postfix',
}

export class Expressor {
	compiler: CompilerInterface;

	constructor(compiler: CompilerInterface = null) {
		this.compiler = compiler;
	}

	toExpressables(
		tokens: ExpressableToken[],
		settings: ExpressorExpressSettings = {},
	): Expressable[] {
		return tokens.map((token, pos) => {
			settings.position =
				pos === 0
					? ExpressorExpressPosition.first
					: pos === tokens.length - 1
						? ExpressorExpressPosition.last
						: ExpressorExpressPosition.middle;

			return token.toExpressable(this.compiler, settings);
		});
	}

	express(
		tokens: ExpressableToken[],
		mode: ExpressorModes,
		settings: ExpressorExpressSettings = {},
	): Expressable[] {
		const infix: Expressable[] = this.toExpressables(tokens, settings);

		if (mode === ExpressorModes.infix) {
			return infix;
		} else {
			const processed = infix.reduce(
				(state, exp) => {
					if (exp.usage === ExpressableUsages.operation) {
						while (
							state.ops.length &&
							exp.settings.rank >= state.ops[0].settings.rank
						) {
							state.postfix.push(state.ops.shift());
						}

						state.ops.unshift(exp);
					} else {
						state.postfix.push(exp);
					}

					return state;
				},
				{postfix: [], ops: []},
			);

			return processed.ops.reduce((agg, op) => {
				agg.push(op);

				return agg;
			}, processed.postfix);
		}
	}

	makeExecutable(tokens: ExpressableToken[]): ExecutableFunction {
		return this.express(tokens, ExpressorModes.postfix).reduce(
			(stack, exp) => {
				if (exp.usage === ExpressableUsages.value) {
					stack.push(exp.prepare());
				} else {
					const right = stack.pop();
					const left = stack.pop();

					stack.push(function preparedBlock(ctx) {
						return exp.eval(left(ctx), right(ctx));
					});
				}

				return stack;
			},
			[],
		)[0];
	}
}
