import {
	Compiler,
	ExecutableFunction,
	Expressable,
	ExpressorModes,
} from '@bmoor/compiler';

import {reduceExpressables} from './operands';
import {ParserModes, ParserSettings} from './parser.interface';
import {BracketPattern} from './pattern/bracket';
import {DotPattern} from './pattern/dot';
import {RTN_VALUE} from './token/accessor';

export type ReaderFunction = ExecutableFunction;
export type WriterFunction = ExecutableFunction;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type PathContent = any;

type ArrayOperations = {
	ops: Expressable[];
	array: Expressable;
};

function createArrayReader(cur: ArrayOperations): ReaderFunction {
	return function (obj): PathContent {
		let rtn = obj;
		for (let i = 0, c = cur.ops.length; i < c; i++) {
			const val = cur.ops[i].eval(rtn);

			if (val === undefined) {
				rtn = undefined;
				i = c;
			} else {
				rtn = val;
			}
		}

		if (rtn == undefined) {
			return rtn;
		} else if (cur.array) {
			return cur.array.eval(rtn);
		} else {
			return rtn;
		}
	};
}

function readArray(arr, [fn, ...rest]: ReaderFunction[]) {
	if (rest.length) {
		const rtn = [];
		for (let i = 0, c = arr.length; i < c; i++) {
			const datum = arr[i];
			const val = fn(datum);

			if (val == undefined) {
				rtn.push(val);
			} else {
				rtn.push(readArray(val, rest));
			}
		}

		return rtn;
	} else {
		return arr.map(fn);
	}
}

function createReader(ops: Expressable[]): ReaderFunction {
	const chunks = reduceExpressables(ops);

	if (chunks.length > 1) {
		const [first, ...fns]: ReaderFunction[] =
			chunks.map(createArrayReader);

		return function (obj) {
			return readArray(first(obj), fns);
		};
	} else {
		return createArrayReader(chunks[0]);
	}
}

function createArrayWriter(
	cur: ArrayOperations,
	final: boolean, //
	object = true, // object || array
): WriterFunction {
	const setter = cur.ops.length ? cur.ops.pop() : null;

	return function (obj, value: PathContent) {
		if (value === undefined) {
			return undefined;
		}

		const root = cur.ops.reduce((agg, exp) => exp.eval(agg), obj);

		if (cur.array) {
			let existing = setter ? setter.eval(root, RTN_VALUE) : root;

			if (final) {
				// if final, we are dealing with leaves
				if (existing) {
					existing.splice(0, value.length, ...value);
				} else {
					existing = value;
				}
			} else {
				if (!existing) {
					existing = [];
				}

				for (let i = 0, c = value.length; i < c; i++) {
					if (!existing[i]) {
						existing[i] = object ? {} : [];
					}
				}
			}

			if (setter) {
				setter.eval(root, existing);
			}

			return existing;
		} else if (setter) {
			setter.eval(root, value);

			return value;
		} else {
			throw new Error('well this is no good');
		}
	};
}

function writeArray(
	obj,
	arr: PathContent[],
	[fn, ...rest]: WriterFunction,
): WriterFunction {
	for (let i = 0, c = arr.length; i < c; i++) {
		const value = arr[i];
		const tgt = obj[i];

		if (rest.length) {
			writeArray(fn(tgt, value), value, rest);
		} else {
			fn(tgt, value);
		}
	}

	return obj;
}

function createWriter(ops: Expressable[]): WriterFunction {
	const chunks = reduceExpressables(ops);

	if (chunks.length > 1) {
		const [first, ...fns]: WriterFunction[] = chunks.map(
			(op, pos, arr) => {
				const final = arr.length - 1;

				// null > 0 === false ... it won't matter because final will be true
				return createArrayWriter(
					op,
					pos === final,
					arr[pos + 1]?.ops.length > 0,
				);
			},
		);

		return function (obj, value: PathContent[]) {
			return writeArray(first(obj, value), value, fns);
		};
	} else {
		return createArrayWriter(chunks[0], true);
	}
}

export class Parser extends Compiler {
	constructor() {
		super({
			tokenizer: [new DotPattern(), new BracketPattern()],
			reducer: [],
		});
	}

	express(
		str: string,
		mode: ParserModes = ParserModes.read,
	): Expressable[] {
		return this.expressor.express(this.parse(str), ExpressorModes.infix, <
			ParserSettings
		>{
			mode,
		});
	}

	compile(
		str: string,
		mode: ParserModes = ParserModes.read,
	): ReaderFunction | WriterFunction {
		const ops: Expressable[] = this.express(str, mode);

		return mode === ParserModes.read
			? createReader(ops)
			: createWriter(ops);
	}

	getReader(str: string): ReaderFunction {
		return this.compile(str, ParserModes.read);
	}

	getWriter(str: string): WriterFunction {
		return this.compile(str, ParserModes.write);
	}
}

export const parser = new Parser();
