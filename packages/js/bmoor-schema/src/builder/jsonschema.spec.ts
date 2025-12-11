import {expect} from 'chai';

import {FieldUse} from '../field.interface.ts';
import {Schema} from '../schema.ts';
import {types} from '../typing.ts';
import {generateJsonSchema} from './jsonschema.ts';

describe('@bmoor/schema :: BuilderJSONSchema', function () {
	it('should properly generate a json schema', function () {
		const schema = new Schema(types, {
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
				},
				fail: {
					use: FieldUse.synthetic,
					type: 'string',
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
				{
					ref: 'fail',
					path: 'should.fail',
				},
			],
		});

		// TODO: need to set environment
		expect(generateJsonSchema(schema)).to.deep.equal({
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
