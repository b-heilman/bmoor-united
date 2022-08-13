import {Expressable} from '@bmoor/compiler';

import {Parser} from './parser';
import {ParserModes} from './parser.interface';
import {createOperands, Operand} from './operands';

type mapping = {
	from: string;
	to: string;
};

const pathParser = new Parser();

type MappingIndex = Map<
	string,
	{
		exp: Expressable;
		next?: MappingIndex;
		ref?: string;
	}
>;

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

export class Mappings {
	fromMap: MappingIndex;
	toMap: MappingIndex;

	constructor(settings: mapping[]) {
		// convert the mappings into a unified
		this.fromMap = new Map();
		this.toMap = new Map();

		settings.forEach((mapping, i) =>
			addMapping(`p${i}`, this.fromMap, this.toMap, mapping)
		);
	}
}
