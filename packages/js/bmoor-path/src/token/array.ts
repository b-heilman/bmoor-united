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
				let rtn;

				if (settings.position === 'last' && settings.hook) {
					rtn = arr.map((v) => settings.hook(v));
				} else {
					rtn = arr.slice(0);
				}

				return rtn;
			});
		} else {
			return new Expressable(this, ExpressableUsages.value, (arr) => {
				let rtn;

				if (this.content === '') {
					rtn = arr.slice(0);
				} else {
					const [begin, end] = this.content.split(':');

					rtn = arr.slice(begin || 0, end || arr.length);
				}

				if (settings.position === 'last' && settings.hook) {
					return rtn.map((v) => settings.hook(v));
				} else {
					return rtn;
				}
			});
		}
	}
}
