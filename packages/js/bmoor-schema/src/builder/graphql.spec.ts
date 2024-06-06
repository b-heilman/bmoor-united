import {expect} from 'chai';

import {Schema} from '../schema';
import {types} from '../typing';
import {BuilderGraphql} from './graphql';

describe('@bmoor/schema :: BuilderGraphql', function () {
	it('should properly generate a json schema', function () {
		const schemas = {
			's-1': new Schema({
				fields: [
					{
						path: 'foo',
						info: {
							type: 'string',
						},
					},
					{
						path: 'bar',
						info: {
							type: 'number',
						},
					},
				],
			}),
			's-2': new Schema({
				fields: [
					{
						path: 'hello',
						info: {
							type: 'string',
						},
					},
					{
						path: 'world',
						info: {
							type: 'number',
						},
					},
				],
			}),
			's-3': new Schema({
				fields: [
					{
						path: 'id',
						info: {
							use: 'primary',
							type: 'string',
						},
					},
					{
						path: 'otherId',
						info: {
							type: 'string',
						},
					},
					{
						path: 'mount',
						info: {
							type: 'array',
						},
					},
					{
						path: 'parent',
						info: {
							type: 'object',
						},
					},
				],
				relationships: [
					{
						reference: 'parent',
						type: 'toOne',
						fields: ['otherId'],
						other: 's-1',
						otherFields: ['hello'],
					},
					{
						reference: 'mount',
						type: 'toMany',
						fields: ['id'],
						other: 's-1',
						otherFields: ['foo'],
					},
				],
			}),
		};

		const formatter = new BuilderGraphql({
			getValidator() {
				return () => Promise.resolve('fail');
			},
			getTyping(ref) {
				return types.getType(ref);
			},
			getSchema(ref) {
				return schemas[ref];
			},
			getConnector() {
				return null;
			},
		});

		formatter.addSchema(schemas['s-3']);

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
