import {
	Token,
	ExpressableUsages,
	Expressable,
	CompilerInterface
} from '@bmoor/compiler';

import {ParserModes, ParserSettings} from '../parser.interface';

// Doing this because null or undefined COULD be valid parameter values
export const NO_VALUE = Symbol('no-value');
export const RTN_VALUE = Symbol('return-value');

export class AccessorToken extends Token {
	static reference = 'accessor-token';

	toExpressable(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		compiler: CompilerInterface = null,
		settings: ParserSettings = {mode: ParserModes.read}
	) {
		if (
			this.content === '__proto__' ||
			this.content === 'constructor' ||
			this.content === 'prototype'
		) {
			throw new Error(`can not access ${this.content} in path`);
		}

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
					} else if (value === RTN_VALUE) {
						return obj[this.content];
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
