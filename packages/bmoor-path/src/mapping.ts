import {Expressable} from '@bmoor/compiler';

import {Parser, WriterFunction, ReaderFunction} from './parser';
import {ParserModes} from './parser.interface';
import {mapping} from './mapping.interface';
import {OperandIndex, indexExpressables, ArrayInfo} from './operands';

const pathParser = new Parser();

function addMapping(
	ref: string,
	fromMap: OperandIndex,
	toMap: OperandIndex,
	m: mapping
) {
	const from: Expressable[] = pathParser.express(m.from, ParserModes.read);
	const to: Expressable[] = pathParser.express(m.to, ParserModes.write);

	indexExpressables(ref, to, toMap, indexExpressables(ref, from, fromMap));
}

function readArray(
	tgt,
	src,
	[info, ...rest]: ArrayInfo[],
	dexCommand: OperandIndex
) {
	if (info.leafRef) {
		// reading .foo[]
		tgt[info.ref] = src.map((value) => ({
			[info.leafRef]: value
		}));
	} else if (rest.length) {
		// reading [][]
		tgt[info.ref] = src.map((arr) => readArray({}, arr, rest, dexCommand));
	} else {
		// reading [].foo
		tgt[info.ref] = src.map((datum) => runReaderMap(dexCommand, {}, datum));
	}

	return tgt;
}

function reduceReadArrays(tgt, obj, dexCommand: OperandIndex) {
	const base = dexCommand.exp.eval(obj);

	return readArray(tgt, base, dexCommand.array, dexCommand);
}

/***
 * This method will reduce an array to a 'normalized' one.  By that, it flattens
 * all object down to one level, but arrays retain their dimensions.
 * ----
 * This should simplify logic down the road when I am trying to rehydrate into
 * a different shape.  I am sure I can optimize more in the future, but for now
 * I want to establish the pattern.
 */
function runReaderMap(dex: OperandIndex, tgt, obj) {
	const it = dex.values();

	let entry = it.next();
	while (!entry.done) {
		const dexCommand = <OperandIndex>entry.value;

		// TODO: handle arrays
		if (dexCommand.array.length) {
			reduceReadArrays(tgt, obj, dexCommand);
		} else if (dexCommand.size) {
			// leaves don't have next, so this is get and run children
			runReaderMap(dexCommand, tgt, dexCommand.exp.eval(obj));
		} else {
			// if we are on a leaf, access the data and write it back
			tgt[dexCommand.ref] = dexCommand.exp.eval(obj);
		}

		entry = it.next();
	}

	return tgt;
}

function createReader(dex: OperandIndex): ReaderFunction {
	return function (tgt, obj) {
		runReaderMap(dex, tgt, obj);

		return tgt;
	};
}

function writeArray(
	tgt,
	src,
	[info, ...rest]: ArrayInfo[],
	dexCommand: OperandIndex,
	offset = -1
) {
	if (offset === -1) {
		if (info.sources.length > 1) {
			for (let i = 0, c = info.sources.length; i < c; i++) {
				writeArray(tgt, src, [info, ...rest], dexCommand, i);
			}

			return tgt;
		} else {
			offset = 0;
		}
	}

	if (info.leafRef) {
		// reading .foo[]
		src[info.ref].map((datum, i) => {
			tgt[i] = datum[info.leafRef];
		});
	} else {
		const arrayRef = info.sources[offset];
		const mySrc = src[arrayRef];

		if (rest.length) {
			// reading [][]
			mySrc.map((arr, i) => {
				let myTgt = tgt[i];

				if (!myTgt) {
					myTgt = [];
					tgt[i] = myTgt;
				}

				writeArray(myTgt, arr, rest, dexCommand, offset);
			});
		} else {
			// reading [].foo
			mySrc.map((datum, i) => {
				let myTgt = tgt[i];

				if (!myTgt) {
					myTgt = {};
					tgt[i] = myTgt;
				}

				runWriterMap(dexCommand, myTgt, datum, arrayRef);
			});
		}
	}

	return tgt;
}

function runWriterMap(dex: OperandIndex, tgt, obj, filter = null) {
	const it = dex.values();

	let entry = it.next();
	while (!entry.done) {
		const dexCommand = <OperandIndex>entry.value;
		const setter = dexCommand.exp;

		if (!filter || dexCommand.filter === filter) {
			if (dexCommand.array.length) {
				const nextTgt = [];

				writeArray(nextTgt, obj, dexCommand.array, dexCommand);

				setter.eval(tgt, nextTgt);
			} else if (dexCommand.size) {
				// leaves don't have next, so this is set and run children
				const nextTgt = {};

				setter.eval(tgt, nextTgt);

				runWriterMap(dexCommand, nextTgt, obj);
			} else {
				// if we are on a leaf, access the data and write it back
				setter.eval(tgt, obj[dexCommand.ref]);
			}
		}

		entry = it.next();
	}

	return tgt;
}

function createWriter(dex: OperandIndex): WriterFunction {
	return function (tgt, obj) {
		runWriterMap(dex, tgt, obj);

		return tgt;
	};
}

export class Mapping {
	read: ReaderFunction;
	write: WriterFunction;

	constructor(mappings: mapping[]) {
		// convert the mappings into a unified
		const fromMap = new OperandIndex('root');
		const toMap = new OperandIndex('root');

		for (let i = 0, c = mappings.length; i < c; i++) {
			addMapping(`p${i}`, fromMap, toMap, mappings[i]);
		}

		this.read = createReader(fromMap);
		this.write = createWriter(toMap);
	}

	map(tgt, src) {
		const t = this.read({}, src);

		return this.write(tgt, t);
	}

	transform(src) {
		return this.map({}, src);
	}
}
