import {
	CompilerInterface,
	Expressable,
	ExpressableUsages,
	Token,
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
		settings: ParserSettings = {mode: ParserModes.read},
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
						if (settings.position === 'last') {
							obj[this.content] = settings.hook
								? settings.hook(value)
								: value;

							return obj;
						} else {
							obj[this.content] = value;
						}
					}
				},
			);
		} else {
			return new Expressable(this, ExpressableUsages.value, (obj) => {
				if (obj === undefined) {
					// I think it's ok to silently fail here
					return obj;
				}

				const v = obj[this.content];

				if (settings.position === 'last' && settings.hook) {
					return settings.hook(v);
				} else {
					return v;
				}
			});
		}
	}
}
