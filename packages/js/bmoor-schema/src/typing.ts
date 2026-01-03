import type {
	TypingAlias,
	TypingInterface,
	TypingJSON,
	TypingReference,
} from './typing.interface.ts';

export class Typing<
	TypeT extends TypingAlias = TypingAlias,
> implements TypingInterface<TypeT> {
	index: Record<TypingReference, TypingJSON<TypeT>>;

	constructor(types: Record<TypingReference, TypingJSON<TypeT>> = {}) {
		this.index = types;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<TypingReference, TypingJSON<TypeT>>) {
		this.index = {...this.index, ...types};
	}

	addType(type: TypingReference, info: TypingJSON<TypeT>) {
		this.index[type] = info;
	}

	getType(type: TypingReference): TypingJSON<TypeT> | null {
		if (type in this.index) {
			return this.index[type];
		} else {
			return null;
		}
	}

	addValidation(type: TypingReference, validation: string) {
		if (type in this.index) {
			const validations = this.index[type].info.validations;

			validations.push(validation);
		}
	}

	removeValidation(type: TypingReference, validation: string) {
		if (type in this.index) {
			const validations = this.index[type].info.validations;

			this.index[type].info.validations = validations.filter(
				(v) => v !== validation,
			);
		}
	}

	extend<ExtendedT extends TypeT>(
		types: Record<TypingReference, Omit<ExtendedT, keyof TypeT>>,
	): Typing<ExtendedT> {
		const def: Record<TypingReference, TypingJSON<ExtendedT>> = {};

		for (const [key, value] of Object.entries(this.index)) {
			def[key] = {
				alias: <ExtendedT>(<unknown>{...value.alias, ...types[key]}),
				info: {
					validations: value.info.validations.slice(0),
				},
			};
		}

		return new Typing<ExtendedT>(def);
	}

	clone(): Typing<TypeT> {
		const def: Record<TypingReference, TypingJSON<TypeT>> = {};

		for (const [key, value] of Object.entries(this.index)) {
			// need to do a deep copy
			def[key] = {
				alias: {...value.alias},
				info: {
					validations: value.info.validations.slice(0),
				},
			};
		}

		return new Typing<TypeT>(def);
	}
}

export const types = new Typing<TypingAlias>({
	string: {
		alias: {
			json: 'string',
			typescript: 'string',
			python: 'str',
		},
		info: {
			validations: ['string'],
		},
	},
	number: {
		alias: {
			json: 'number',
			typescript: 'number',
			python: 'float',
		},
		info: {
			validations: ['number'],
		},
	},
	int: {
		alias: {
			json: 'number',
			typescript: 'number',
			python: 'int',
		},
		info: {
			validations: ['number', 'int'],
		},
	},
	float: {
		alias: {
			json: 'number',
			typescript: 'number',
			python: 'float',
		},
		info: {
			validations: ['number', 'float'],
		},
	},
	boolean: {
		alias: {
			json: 'boolean',
			typescript: 'boolean',
			python: 'bool',
		},
		info: {
			validations: ['bool'],
		},
	},
	// POJO generic
	object: {
		alias: {
			json: 'object',
			typescript: 'object',
			python: 'dict',
		},
		info: {
			validations: ['object'],
		},
	},
	// Array is now an attribute
});
