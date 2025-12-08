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

	getType(type: TypingReference): TypeT {
		return this.index[type];
	}
}

export const types = new Typing<TypingJSON>({
	string: {
		json: 'string',
		typescript: 'string',
		python: 'str'
	},
	number: {
		json: 'number',
		typescript: 'number',
		python: 'float'
	},
	int: {
		json: 'number',
		typescript: 'number',
		python: 'int'
	},
	float: {
		json: 'number',
		typescript: 'number',
		python: 'float'
	},
	boolean: {
		json: 'boolean',
		typescript: 'boolean',
		python: 'bool'
	},
	object: {
		json: 'object',
		typescript: 'object',
		python: 'dict'
	},
	array: {
		json: 'array',
		typescript: 'array',
		python: 'list'
	},
});
