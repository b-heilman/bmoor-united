import {expect} from 'chai';

import {toJSONSchema} from './methods';
import {Schema} from './schema';
import {types} from './typing';

describe('@bmoor/schema :: methods', function () {
	describe('toJSONSchema', function () {
		it('should properly generate a json schema', function () {
			const schema = new Schema({
				info: {
					bar: {
						type: 'string',
					},
					bar2: {
						type: 'number',
					},
					world: {
						type: 'number',
					},
					other: {
						type: 'string',
					},
				},
				structure: [
					{
						path: 'foo.bar',
						ref: 'bar',
					},
					{
						path: 'foo.bar2',
						ref: 'bar2',
					},
					{
						path: 'hello[].world',
						ref: 'world',
					},
					{
						path: 'hello[].otherWorld[]',
						ref: 'other',
					},
				],
			});

			const ctx = {
				getValidation() {
					return () => Promise.resolve('fail');
				},
				getTyping(ref) {
					return types.getType(ref);
				},
				getSchema() {
					return schema;
				},
				getConnection() {
					return null;
				},
				formatName(name) {
					return name;
				},
			};

			expect(toJSONSchema(ctx, schema)).to.deep.equal({
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
});
