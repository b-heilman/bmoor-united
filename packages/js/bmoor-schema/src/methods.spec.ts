import {expect} from 'chai';

import {toJSONSchema} from './methods.ts';
import {Schema} from './schema.ts';
import {SchemaContext} from './schema/context.ts';
import {TypingJSON} from './typing.interface.ts';
import {types} from './typing.ts';
import {validations} from './validator.ts';

describe('@bmoor/schema :: methods', function () {
	let ctx;

	beforeEach(function () {
		ctx = new SchemaContext<TypingJSON>(types, validations);
	});

	describe('toJSONSchema', function () {
		it('should properly generate a json schema', function () {
			const schema = new Schema(ctx, {
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
