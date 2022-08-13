import {Expressable} from '@bmoor/compiler';

import {Parser, WriterFunction, ReaderFunction} from './parser';
import {ParserModes} from './parser.interface';
import {MappingIndex, mapping} from './mapping.interface';

const pathParser = new Parser();

// reduces all Expressables to an series of property maps
function mapExpressables(
	ref: string,
	exps: Expressable[],
	target: MappingIndex
) {
	const chain = exps.reduce((prev: MappingIndex, exp: Expressable, i) => {
		let next: MappingIndex = null;

		if (prev.has(<string>exp.token.content)) {
			next = prev.get(exp.token.content).next;
		} else {
			let cur = null;

			// I would love to not do this, but for now...
			if (i < exps.length - 1) {
				next = new Map();

				cur = {
					exp,
					next
				};
			} else {
				next = null;

				cur = {
					exp,
					ref
				};
			}

			prev.set(exp.token.content, cur);
		}

		return next;
	}, target);
}

function addMapping(
	ref: string,
	fromMap: MappingIndex,
	toMap: MappingIndex,
	m: mapping
) {
	const from: Expressable[] = pathParser.express(m.from, ParserModes.read);
	const to: Expressable[] = pathParser.express(m.to, ParserModes.write);

	if (from.length !== to.length) {
		throw new Error(`not compatible: ${m.from} => ${m.to}`);
	}

	mapExpressables(ref, from, fromMap);
	mapExpressables(ref, to, toMap);
}

function runReaderMap(dex: MappingIndex, tgt, obj) {
	const it = dex.values();

	let entry = it.next();
	while (!entry.done) {
		const dexCommand = entry.value;

		// TODO: handle arrays
		if (dexCommand.next) {
			// leaves don't have next, so this is get and run children
			runReaderMap(dexCommand.next, tgt, dexCommand.exp.eval(obj));
		} else {
			// if we are on a leaf, access the data and write it back
			tgt[dexCommand.ref] = dexCommand.exp.eval(obj);
		}

		entry = it.next();
	}
}

function createReader(dex: MappingIndex): ReaderFunction {
	return function (tgt, obj) {
		runReaderMap(dex, tgt, obj);

		return tgt;
	};
}

function runWriterMap(dex: MappingIndex, tgt, obj) {
	const it = dex.values();

	let entry = it.next();
	while (!entry.done) {
		const dexCommand = entry.value;

		// TODO: handle arrays
		if (dexCommand.next) {
			// leaves don't have next, so this is get and run children
			const next = {};

			dexCommand.exp.eval(tgt, next);

			runWriterMap(dexCommand.next, next, obj);
		} else {
			// if we are on a leaf, access the data and write it back
			dexCommand.exp.eval(tgt, obj[dexCommand.ref]);
		}

		entry = it.next();
	}
}

function createWriter(dex: MappingIndex): WriterFunction {
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
