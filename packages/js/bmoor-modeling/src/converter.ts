import {FieldType} from '@bmoor/schema';

import {ConvertFn, ConveterInterface} from './converter.interface';

export class Converter implements ConveterInterface {
	index: Record<FieldType, Record<FieldType, ConvertFn>>;

	constructor(
		converters: Record<FieldType, Record<FieldType, ConvertFn>> = {},
	) {
		this.index = converters;
	}

	clear() {
		this.index = {};
	}

	define(converters: Record<FieldType, Record<FieldType, ConvertFn>>) {
		this.index = {...this.index, ...converters};
	}

	addConverter(from: FieldType, to: FieldType, fn: ConvertFn): void {
		if (!(from in this.index)) {
			this.index[from] = {};
		}

		this.index[from][to] = fn;
	}

	getConverter(from: FieldType, to: FieldType): ConvertFn {
		const t = this.index[from];

		if (t) {
			return t[to];
		}

		return undefined;
	}
}

export const converter = new Converter({
	string: {
		json: (v: string) => JSON.parse(v),
	},
	json: {
		string: (v: object) => JSON.stringify(v),
	},
});
