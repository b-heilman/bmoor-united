import {Expressable} from '@bmoor/compiler';

import {Parser, WriterFunction, ReaderFunction} from './parser';
import {ParserModes} from './parser.interface';
import {mapping} from './mapping.interface';
import {OperandIndex, indexExpressables} from './operands';

const pathParser = new Parser();

function addMapping(
	ref: string,
	fromMap: OperandIndex,
	toMap: OperandIndex,
	m: mapping
) {
	const from: Expressable[] = pathParser.express(m.from, ParserModes.read);
	const to: Expressable[] = pathParser.express(m.to, ParserModes.write);

	indexExpressables(ref, from, fromMap);
	indexExpressables(ref, to, toMap);
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
		const dexCommand = entry.value;

		// TODO: handle arrays
		if (dexCommand.next) {
			// leaves don't have next, so this is get and run children
			if (dexCommand.isArray) {
				tgt[dexCommand.ref] = obj.map((datum) =>
					runReaderMap(dexCommand.next, {}, datum)
				);
			} else {
				runReaderMap(dexCommand.next, tgt, dexCommand.exp.eval(obj));
			}
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

function runWriterMap(dex: OperandIndex, tgt, obj) {
	const it = dex.values();

	let entry = it.next();
	while (!entry.done) {
		const dexCommand = entry.value;
		const setter = dexCommand.exp;

		// TODO: handle arrays
		if (dexCommand.next) {
			// leaves don't have next, so this is set and run children
			if (dexCommand.isArray) {
				// obj[dexCommand.ref]
			} else {
				const next = {};

				setter.eval(tgt, next);

				runWriterMap(dexCommand.next, next, obj);
			}
		} else {
			// if we are on a leaf, access the data and write it back
			setter.eval(tgt, obj[dexCommand.ref]);
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
		const fromMap = new Map();
		const toMap = new Map();

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
