import {
	CompilerInterface,
	Expressable,
	ExpressableUsages,
	Token,
} from '@bmoor/compiler';

import {ParserModes, ParserSettings} from '../parser.interface';

export class ArrayToken extends Token {
	static reference = 'array-token';

	toExpressable(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		compiler: CompilerInterface = null,
		settings: ParserSettings = {mode: ParserModes.read},
	) {
		if (settings.mode === ParserModes.write) {
			return new Expressable(this, ExpressableUsages.value, (arr) => {
				return arr.slice(0);
			});
		} else {
			return new Expressable(this, ExpressableUsages.value, (arr) => {
				if (this.content === '') {
					return arr.slice(0);
				} else {
					const [begin, end] = this.content.split(':');

					return arr.slice(begin || 0, end || arr.length);
				}
			});
		}
	}
}
