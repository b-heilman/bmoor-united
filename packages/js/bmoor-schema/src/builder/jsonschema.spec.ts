import {expect} from 'chai';

import {Schema} from '../schema.ts';
import {types} from '../typing.ts';
import {generateJsonSchema} from './jsonschema.ts';
import { Environment } from '../environment.ts';
import type { TypingAlias } from '../typing.interface.ts';

describe('@bmoor/schema :: BuilderJSONSchema', function () {
	let env: Environment<TypingAlias>;
	
	beforeEach(function () {
		env = new Environment<TypingAlias>(types);
	});

	it('should properly generate a json schema', function () {
		const schema = new Schema({
			reference: 'test',
			info: {
				'f-1': {
					type: 'string',
				},
				'f-2': {
					type: 'number',
				},
				'f-3': {
					type: 'number',
				},
				'f-4': {
					type: 'string',
					isMany: true,
				},
			},
			structure: [
				{
					ref: 'f-1',
					path: 'foo.bar',
				},
				{
					ref: 'f-2',
					path: 'foo.bar2',
				},
				{
					ref: 'f-3',
					path: 'hello[].world',
				},
				{
					ref: 'f-4',
					path: 'hello[].other_world[]',
				},
			],
		});

		expect(generateJsonSchema(env, schema)).to.deep.equal({
			type: 'object',
			properties: {
				foo: {
					type: 'object',
					properties: {
						bar: {
							type: 'string',
						},
						bar2: {
							type: 'number',
						},
					},
				},

				hello: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							world: {
								type: 'number',
							},
							other_world: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
						},
					},
				},
			},
		});
	});
});
