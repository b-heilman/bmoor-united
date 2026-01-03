import {types as oldTypes} from '@bmoor/schema';

import type {ModelingTypingAlias} from './typing.interface.ts';

export const types = oldTypes.extend<ModelingTypingAlias>({
	string: {
		graphql: 'String',
	},
	number: {
		graphql: 'Float',
	},
	int: {
		graphql: 'Int',
	},
	float: {
		graphql: 'Float',
	},
	boolean: {
		graphql: 'Boolean',
	},
	object: {
		graphql: null,
	}
});
