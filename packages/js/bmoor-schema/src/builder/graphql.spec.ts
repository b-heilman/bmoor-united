import {expect} from 'chai';

import {Schema} from '../schema';
import {types} from '../typing';
import {BuilderGraphql} from './graphql';

describe('@bmoor/schema :: BuilderGraphql', function () {
	it('should properly generate a json schema', function () {
		const schemas = {
			's-1': new Schema({
				reference: 's-1',
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
				reference: 's-2',
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
				connection: {
					connector: 'junk',
					actions: {
						eins: 'string',
						zwei: 'float',
					},
				},
			}),
			's-3': new Schema({
				reference: 's-3',
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
							required: true,
							type: 'string',
						},
					},
					{
						path: 'mount',
						info: {
							use: 'synthetic',
							type: 'array',
						},
					},
					{
						path: 'parent',
						info: {
							use: 'synthetic',
							type: 'object',
						},
					},
				],
				relationships: [
					{
						reference: 'parent',
						type: 'toOne',
						fields: ['otherId'],
						other: 's-2',
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
				return () => null;
			},
		});

		formatter.addSchema(schemas['s-3']);

		expect(formatter.toJSON()).to.deep.equal({
			id: 'ID!',
			otherId: 'String!',
			'parent(hello: String, eins: String, zwei: Float)': 's-2',
			'mount(foo: String)': '[s-1]',
		});

		expect(formatter.toString().replace(/\s/g, '')).to.deep.equal(
			`
			type s-3 {
			id: ID!
			otherId: String!
			parent(hello: String, eins: String, zwei: Float): s-2
			mount(foo: String): [s-1]
			}
		`.replace(/\s/g, ''),
		);
	});
});
