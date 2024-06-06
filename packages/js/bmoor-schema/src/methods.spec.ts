import {expect} from 'chai';

import {fromStructureSchema, toJSONSchema} from './methods';
import {Schema} from './schema';
import {types} from './typing';

describe('@bmoor/schema :: methods', function () {
	describe('toJSONSchema', function () {
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
				],
			});

			const ctx = {
				getValidator() {
					return () => Promise.resolve('fail');
				},
				getTyping(ref) {
					return types.getType(ref);
				},
				getSchema() {
					return schema;
				},
				getConnector() {
					return null;
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

	describe('fromStructureSchema', function () {
		it('should properly generate a json schema', function () {
			const schema = new Schema(
				fromStructureSchema({
					structure: {
						foo: {
							bar: 'foo-bar',
							bar2: 'foo-bar-2',
						},
						hello: [
							{
								world: 'hello-world',
								otherWorld: ['other'],
							},
						],
					},
					info: {
						'foo-bar': {
							type: 'string',
						},
						'foo-bar-2': {
							type: 'number',
						},
						'hello-world': {
							type: 'number',
						},
						other: {
							type: 'string',
						},
					},
				}),
			);

			const ctx = {
				getValidator() {
					return () => Promise.resolve('fail');
				},
				getTyping(ref) {
					return types.getType(ref);
				},
				getSchema() {
					return schema;
				},
				getConnector() {
					return null;
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
