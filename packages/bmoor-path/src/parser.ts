import {
	Pattern,
	Token,
	TokenizerState,
	Compiler,
	ExpressableUsages,
	Expressable,
	ExecutableFunction,
	ExpressorModes,
	CompilerInterface
} from '@bmoor/compiler';

import {ParserModes, ParserSettings} from './parser.interface';

const isVariable = /[A-Za-z_0-9]/;

// Doing this because null or undefined COULD be valid parameter values
const NO_VALUE = Symbol('no-value');

export class AccessorToken extends Token {
	static reference: 'accessor-token';

	toExpressable(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		compiler: CompilerInterface = null,
		settings: ParserSettings = {mode: ParserModes.read}
	) {
		if (settings.mode === ParserModes.write) {
			return new Expressable(
				this,
				ExpressableUsages.value,
				// eslint-disable-next-line  @typescript-eslint/no-explicit-any
				(obj, value: any = NO_VALUE) => {
					if (value === NO_VALUE) {
						let rtn = obj[this.content];

						if (!rtn) {
							rtn = {};

							obj[this.content] = rtn;
						}

						return rtn;
					} else {
						obj[this.content] = value;

						return obj;
					}
				}
			);
		} else {
			return new Expressable(
				this,
				ExpressableUsages.value,
				(obj) => obj[this.content]
			);
		}
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

	toExpressable(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		compiler: CompilerInterface = null,
		settings: ParserSettings = {mode: ParserModes.read}
	) {
		if (settings.mode === ParserModes.write) {
			return new Expressable(this, ExpressableUsages.value, () => {
				// TODO: this won't work...
				return [];
			});
		} else {
			return new Expressable(this, ExpressableUsages.value, (arr) => {
				if (this.content === '') {
					return arr;
				} else {
					// TODO: array operators
					// this.content
				}
			});
		}
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

export type ReaderFunction = ExecutableFunction;

export type WriterFunction = ExecutableFunction;

export type PathContent = any;

function createReader(ops: Expressable[]): ReaderFunction {
	return function (obj): PathContent {
		return ops.reduce((agg, exp) => exp.eval(agg), obj);
	};
}

function createWriter(ops: Expressable[]): ReaderFunction {
	const setter = ops.pop();

	return function (obj, value: PathContent) {
		const root = ops.reduce((agg, exp) => exp.eval(agg), obj);

		setter.eval(root, value);

		return obj;
	};
}

export class Parser extends Compiler {
	constructor() {
		super({
			tokenizer: [new DotPattern(), new BracketPattern()],
			reducer: []
		});
	}

	compile(
		str: string,
		mode: ParserModes = ParserModes.read
	): ReaderFunction | WriterFunction {
		const ops: Expressable[] = this.expressor.express(
			this.parse(str),
			ExpressorModes.infix,
			<ParserSettings>{
				mode
			}
		);

		return mode === ParserModes.read ? createReader(ops) : createWriter(ops);
	}

	getReader(str: string): ReaderFunction {
		return this.compile(str, ParserModes.read);
	}

	getWriter(str: string): WriterFunction {
		return this.compile(str, ParserModes.write);
	}
}

export const parser = new Parser();
