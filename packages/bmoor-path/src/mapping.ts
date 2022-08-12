import {Expressable} from '@bmoor/compiler';

import {Parser} from './parser';
import {ParserModes} from './parser.interface';

type mapping = {
	from: string;
	to: string;
};

const pathParser = new Parser();

function addMapping(dex: MappingIndex, m: mapping) {
	const from: Expressable[] = pathParser.express(m.from, ParserModes.read);
	const to: Expressable[] = pathParser.express(m.to, ParserModes.write);

	console.log(from);
	console.log(to);
}

type MappingIndex = Map<string, Expressable | MappingIndex>;

export class Mappings {
	map: MappingIndex;

	constructor(settings: mapping[]) {
		// convert the mappings into a unified
		this.map = new Map();

		settings.forEach((mapping) => addMapping(this.map, mapping));
	}
}
