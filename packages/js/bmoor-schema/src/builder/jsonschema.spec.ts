import {expect} from 'chai';

import {Dictionary} from '../dictionary';
import {Schema} from '../schema';
import {types} from '../typing';
import {validations} from '../validator';
import {BuilderJSONSchema} from './jsonschema';

describe('@bmoor/schema :: BuilderJSONSchema', function () {
	it('should properly generate a json schema', function () {
		const schema = new Schema({
			reference: 'test',
			fields: [
				{
					path: 'foo.bar',
					info: {
						type: 'string',
					},
				},
				{
					path: 'foo.bar2',
					info: {
						type: 'number',
					},
				},
				{
					path: 'hello[].world',
					info: {
						type: 'number',
					},
				},
				{
					path: 'hello[].other_world[]',
					info: {
						type: 'string',
					},
				},
				{
					path: 'should.fail',
					info: {
						use: 'synthetic',
						type: 'string',
					},
				},
			],
		});

		const dict = new Dictionary(types, validations);

		dict.addSchema(schema);

		const formatter = new BuilderJSONSchema(dict);

		formatter.addSchema(schema);

		expect(formatter.toJSON()).to.deep.equal({
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
