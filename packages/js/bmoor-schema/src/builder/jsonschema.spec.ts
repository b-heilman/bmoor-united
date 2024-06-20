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
					use: 'synthetic',
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
