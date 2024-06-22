import {expect} from 'chai';

import {
	Dictionary,
	Schema,
	SchemaInterface,
	TypingJSON,
	types,
	validations,
} from '@bmoor/schema';

import {BuilderGraphql} from './graphql';

describe('@bmoor/schema :: BuilderGraphql', function () {
	it('should properly generate a json schema', function () {
		const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
			types,
			validations,
		);

		dictionary.addSchema(
			new Schema({
				reference: 's-1',
				info: {
					foo: {
						type: 'string',
					},
					bar: {
						type: 'number',
					},
				},
				structure: [
					{
						path: 'foo',
						ref: 'foo',
					},
					{
						path: 'bar',
						ref: 'foo',
					},
				],
			}),
		);

		dictionary.addSchema(
			new Schema({
				reference: 's-2',
				info: {
					hello: {
						type: 'string',
					},
					world: {
						type: 'number',
					},
				},
				structure: [
					{
						ref: 'hello',
						path: 'hello',
					},
					{
						ref: 'world',
						path: 'world',
					},
				],
			}),
		);

		dictionary.addSchema(
			new Schema({
				reference: 's-3',
				info: {
					id: {
						use: 'primary',
						type: 'string',
					},
					otherId: {
						required: true,
						type: 'string',
					},
					mount: {
						use: 'synthetic',
						type: 'array',
					},
					parent: {
						use: 'synthetic',
						type: 'object',
					},
				},
				structure: [
					{
						ref: 'id',
						path: 'id',
					},
					{
						ref: 'otherId',
						path: 'otherId',
					},
					{
						ref: 'mount',
						path: 'mount',
					},
					{
						ref: 'parent',
						path: 'parent',
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
		);

		const formatter = new BuilderGraphql(dictionary);

		formatter.addSchema(dictionary.getSchema('s-3'));

		expect(formatter.toJSON()).to.deep.equal({
			id: 'ID!',
			otherId: 'String!',
			'parent(hello: String, eins: String, zwei: Float)': 's2',
			'mount(foo: String)': '[s1]',
		});

		expect(formatter.toString().replace(/\s/g, '')).to.deep.equal(
			`
			type s3 {
			id: ID!
			otherId: String!
			parent(hello: String, eins: String, zwei: Float): s2
			mount(foo: String): [s1]
			}
		`.replace(/\s/g, ''),
		);
	});

	it('should properly generate a complex schema', function () {
		const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
			types,
			validations,
		);

		dictionary.addSchema(
			new Schema({
				reference: 's-1',
				info: {
					bar: {
						type: 'string',
					},
					world: {
						type: 'number',
					},
					drei: {
						type: 'float',
					},
				},
				structure: [
					{
						path: 'foo.bar',
						ref: 'bar',
					},
					{
						path: 'hello.world',
						ref: 'world',
					},
					{
						path: 'eins.zwei.drei',
						ref: 'drei',
					},
				],
			}),
		);

		const formatter = new BuilderGraphql(dictionary);

		formatter.addSchema(dictionary.getSchema('s-1'));

		expect(formatter.toJSON()).to.deep.equal({
			foo: {
				bar: 'String',
			},
			hello: {
				world: 'Float',
			},
			eins: {
				zwei: {
					drei: 'Float',
				},
			},
		});

		expect(formatter.toString()).to.deep.equal(
			`type s1 {
	foo: s1Foo
	hello: s1Hello
	eins: s1Eins
}
type s1Foo {
	bar: String
}
type s1Hello {
	world: Float
}
type s1Eins {
	zwei: s1EinsZwei
}
type s1EinsZwei {
	drei: Float
}`,
		);
	});
});
