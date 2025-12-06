import {Typing as OldTyping} from '@bmoor/schema';

import type {TypingJSON} from './typing.interface.ts';

export const types = new OldTyping<TypingJSON>({
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
	json: {
		json: 'object',
		graphql: null,
		typescript: 'object',
	},
});
