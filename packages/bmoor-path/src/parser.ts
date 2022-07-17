import {
	Pattern,
	Token,
	TokenizerState,
	Compiler,
	ExpressableUsages,
	Expressable,
	ExecutableFunction,
	ExpressorModes,
	ExpressableSettings,
	CompilerInterface
} from '@bmoor/compiler';

const isVariable = /[A-Za-z_0-9]/;

export enum ParserModes {
	read = 'read',
	write = 'write'
}

export interface ParserSettings extends ExpressableSettings {
	mode: ParserModes;
}

export class AccessorToken extends Token {
	static reference: 'accessor-token';

	toExpressable(
		compiler: CompilerInterface = null,
		settings: ParserSettings = {mode: ParserModes.read}
	) {
		console.log(settings);
		return new Expressable(ExpressableUsages.value, (obj) => obj[this.content]);
	}
}

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
				return pos;
			}
		}

		return null;
	}

	toToken(base: string, state: TokenizerState) {
		return new AccessorToken(base.substring(state.open, state.close), state, {
			//	subType: this.subType
		});
	}
}

class BracketState extends TokenizerState {
	isQuote: boolean;

	constructor(begin: number, isQuote = false) {
		super(begin);

		this.isQuote = isQuote;
	}
}

export class ArrayToken extends Token {
	static reference: 'array-token';

	toExpressable() {
		return new Expressable(ExpressableUsages.value, (arr) => {
			if (this.content === '') {
				return arr;
			} else {
				// TODO: array operators
				// this.content
			}
		});
	}
}

export class BracketPattern extends Pattern {
	open(str: string, pos: number) {
		const ch = str[pos];

		if (ch === '[') {
			const next = str[pos + 1];

			if (next === '"') {
				return new BracketState(pos + 2, true);
			} else {
				return new BracketState(pos + 1);
			}
		}

		return null;
	}

	close(str: string, pos: number, state: BracketState) {
		const ch = str[pos];

		if (ch === ']') {
			if (state.isQuote) {
				const prev = str[pos - 1];

				if (prev === '"') {
					state.setClose(pos - 1);

					return pos;
				}
			} else {
				state.setClose(pos);

				return pos;
			}
		}

		return null;
	}

	toToken(base: string, state: BracketState) {
		const content = base.substring(state.open, state.close);

		if (state.isQuote) {
			return new AccessorToken(content, state, {
				// 	subType: this.subType
			});
		} else {
			return new ArrayToken(content, state, {
				subType: 'object'
			});
		}
	}
}

export class Parser extends Compiler {
	constructor() {
		super({
			tokenizer: [new DotPattern(), new BracketPattern()],
			reducer: []
		});
	}

	compile(str: string): ExecutableFunction {
		const ops: Expressable[] = this.expressor.express(
			this.parse(str),
			ExpressorModes.infix,
			{}
		);

		return function (obj) {
			return ops.reduce((agg, exp) => exp.eval(agg), obj);
		};
	}
}

export const parser = new Parser();
