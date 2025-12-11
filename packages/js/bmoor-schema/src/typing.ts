import type {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from './typing.interface.ts';

export class Typing<
	TypeT extends TypingJSON = TypingJSON,
> implements TypingInterface<TypeT> {
	index: Record<TypingReference, TypeT>;

	constructor(types: Record<TypingReference, TypeT> = {}) {
		this.index = types;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<TypingReference, TypeT>) {
		this.index = {...this.index, ...types};
	}

	addType(type: TypingReference, info: TypeT) {
		this.index[type] = info;
	}

	getType(type: TypingReference): TypeT | null {
		if (type in this.index) {
			return this.index[type];
		} else {
			return null;
		}
	}

	clone(): Typing<TypeT> {
		return new Typing<TypeT>({...this.index});
	}
}

export const types = new Typing<TypingJSON>({
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
	array: {
		alias: {
			json: 'array',
			typescript: 'array',
			python: 'list',
		},
		info: {
			validations: ['array'],
		},
	},
});
