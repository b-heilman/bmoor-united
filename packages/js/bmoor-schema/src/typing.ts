import {
	TypingInterface,
	TypingJSON,
	TypingReference,
} from './typing.interface';

export class Typing<TypeT extends TypingJSON = TypingJSON>
	implements TypingInterface<TypeT>
{
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

export const types = new Typing({
	string: {
		json: 'string',
		graphql: 'String',
		typescript: 'string',
	},
	number: {
		json: 'number',
		graphql: 'Float',
		typescript: 'number',
	},
	int: {
		json: 'number',
		graphql: 'Int',
		typescript: 'number',
	},
	float: {
		json: 'number',
		graphql: 'Float',
		typescript: 'number',
	},
	boolean: {
		json: 'boolean',
		graphql: 'Boolean',
		typescript: 'boolean',
	},
	object: {
		json: 'object',
		graphql: null,
		typescript: 'object',
	},
	array: {
		json: 'array',
		graphql: null,
		typescript: 'array',
	},
});
