import {expect} from 'chai';

import {Schema} from '../schema';
import {types} from '../typing';
import {BuilderJSONSchema} from './jsonschema';

describe('@bmoor/schema :: BuilderJSONSchema', function () {
	it('should properly generate a json schema', function () {
		const schema = new Schema({
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
					path: 'hello[].otherWorld[]',
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

		const formatter = new BuilderJSONSchema({
			getValidation() {
				return () => Promise.resolve('fail');
			},
			getTyping(ref) {
				return types.getType(ref);
			},
			getSchema() {
				return schema;
			},
			formatName(name) {
				return name;
			},
		});

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
							otherWorld: {
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
