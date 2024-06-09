import {expect} from 'chai';

import {Dictionary} from '../dictionary';
import {Schema} from '../schema';
import {SchemaInterface} from '../schema.interface';
import {types} from '../typing';
import {validations} from '../validator';
import {BuilderGraphql} from './graphql';
import {BuilderGraphqlTypingJSON} from './graphql.interface';

describe('@bmoor/schema :: BuilderGraphql', function () {
	it('should properly generate a json schema', function () {
		const dictionary = new Dictionary<
			BuilderGraphqlTypingJSON,
			SchemaInterface
		>(types, validations);

		dictionary.addSchema(
			new Schema({
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
		);

		dictionary.addSchema(
			new Schema({
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
					reference: 'junk',
					actions: {
						eins: 'string',
						zwei: 'float',
					},
				},
			}),
		);

		dictionary.addSchema(
			new Schema({
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
		);

		const formatter = new BuilderGraphql(dictionary);

		formatter.addSchema(dictionary.getSchema('s-3'));

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

	it('should properly generate a complex schema', function () {
		const dictionary = new Dictionary<
			BuilderGraphqlTypingJSON,
			SchemaInterface
		>(types, validations);

		dictionary.addSchema(
			new Schema({
				reference: 's-1',
				fields: [
					{
						path: 'foo.bar',
						info: {
							type: 'string',
						},
					},
					{
						path: 'hello.world',
						info: {
							type: 'number',
						},
					},
					{
						path: 'eins.zwei.drei',
						info: {
							type: 'float',
						},
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
			`type s-1 {
	foo: s-1_0
	hello: s-1_1
	eins: s-1_2
}
type s-1_0 {
	bar: String
}
type s-1_1 {
	world: Float
}
type s-1_2 {
	zwei: s-1_2_0
}
type s-1_2_0 {
	drei: Float
}`,
		);
	});
});
