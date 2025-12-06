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
	},
	number: {
		json: 'number',
		typescript: 'number',
	},
	int: {
		json: 'number',
		typescript: 'number',
	},
	float: {
		json: 'number',
		typescript: 'number',
	},
	boolean: {
		json: 'boolean',
		typescript: 'boolean',
	},
	object: {
		json: 'object',
		typescript: 'object',
	},
	array: {
		json: 'array',
		typescript: 'array',
	},
});
