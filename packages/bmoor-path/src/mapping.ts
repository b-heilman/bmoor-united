import {Expressable} from '@bmoor/compiler';

import {Parser, WriterFunction, ReaderFunction} from './parser';
import {ParserModes} from './parser.interface';
import {mapping} from './mapping.interface';
import {OperandIndex, indexExpressables, IndexStats} from './operands';

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
		if (dexCommand.size) {
			// leaves don't have next, so this is get and run children
			if (dexCommand.array.length) {
				const info = dexCommand.array[0];
				tgt[info.ref] = dexCommand.exp
					.eval(obj)
					.map((datum) => runReaderMap(dexCommand, {}, datum));
			} else {
				runReaderMap(dexCommand, tgt, dexCommand.exp.eval(obj));
			}
		} else {
			// if we are on a leaf, access the data and write it back
			// leaf array will write to _
			if (dexCommand.array.length) {
				const info = dexCommand.array[0];
				tgt[info.ref] = dexCommand.exp.eval(obj).map((value) => ({
					[info.leafRef]: value
				}));
			} else {
				tgt[dexCommand.ref] = dexCommand.exp.eval(obj);
			}
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

function runWriterMap(dex: OperandIndex, tgt, obj) {
	const it = dex.values();

	let entry = it.next();
	while (!entry.done) {
		const dexCommand = <OperandIndex>entry.value;
		const setter = dexCommand.exp;

		// TODO: handle arrays
		if (dexCommand.size) {
			console.log('write parent');
			// leaves don't have next, so this is set and run children
			if (dexCommand.array.length) {
				const nextTgt = [];
				const info = dexCommand.array[0];
				const srcArr = obj[info.ref];
				console.log('->', info.ref, JSON.stringify(obj, null, 2));
				setter.eval(tgt, nextTgt);

				srcArr.map((src: string, i: number) => {
					let cur = nextTgt[i];
					if (!cur) {
						cur = {};
						nextTgt[i] = cur;
					}

					runWriterMap(dexCommand, cur, src);
				});
			} else {
				const nextTgt = {};

				setter.eval(tgt, nextTgt);

				runWriterMap(dexCommand, nextTgt, obj);
			}
		} else {
			if (dexCommand.array.length) {
				const info = dexCommand.array[0];
				console.log('?', dexCommand.ref, info.ref);
				setter.eval(
					tgt,
					obj[info.ref].map((subObj) => subObj[info.leafRef])
				);
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
		return this.write(tgt, this.read({}, src));
	}

	transform(src) {
		return this.map({}, src);
	}
}
