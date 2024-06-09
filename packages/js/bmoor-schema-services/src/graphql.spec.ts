import {expect} from 'chai';

import {
	BuilderGraphqlTypingJSON,
	Dictionary,
	Schema,
	SchemaInterface,
	types,
	validations,
} from '@bmoor/schema';

import {Graphql} from './graphql';

describe('@bmoor/schema-services', function () {
	let dictionary: Dictionary<BuilderGraphqlTypingJSON, SchemaInterface>;

	beforeEach(function () {
		dictionary = new Dictionary<BuilderGraphqlTypingJSON, SchemaInterface>(
			types,
			validations,
		);

		dictionary.addSchema(
			new Schema({
				reference: 's-1',
				fields: [
					{
						path: 'foo',
						info: {
							use: 'primary',
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
							use: 'primary',
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
	});

	describe('graphql', function () {
		it('should properly generate graphql', function () {
			const graphql = new Graphql(dictionary, {
				query: {
					entry: {
						schema: 's-1',
					},
					singleEntry: {
						schema: 's-3',
						single: true,
					},
				},
				customTypes: {
					Date: null, // doesn't matter
				},
			});

			expect(graphql.toGraphQL()).to.equal(
				`scalar Date
type s-1 {
	foo: ID!
	bar: Float
}
type s-2 {
	hello: ID!
	world: Float
}
type s-3 {
	id: ID!
	otherId: String!
	parent(hello: String, eins: String, zwei: Float): s-2
	mount(foo: String): [s-1]
}
type Query {
	entry(foo: String!): [s-1]
	singleEntry(id: String!): s-3
}`,
			);
		});
	});
});
