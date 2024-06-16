import {ApolloServer, BaseContext} from '@apollo/server';
import {strict as assert} from 'assert';
import {expect} from 'chai';

import {
	Connector,
	Dictionary,
	Schema,
	SchemaInterface,
	TypingJSON,
	types,
	validations,
} from '@bmoor/schema';

import {Graphql} from './graphql';

describe('@bmoor/schema-services : graphql', function () {
	let dictionary: Dictionary<TypingJSON, SchemaInterface>;

	beforeEach(function () {
		dictionary = new Dictionary<TypingJSON, SchemaInterface>(
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
				connection: {
					reference: 'foo',
				},
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
					reference: 'hello',
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
				connection: {
					reference: 'stub',
				},
			}),
		);

		dictionary.setConnector(
			new Connector({
				foo: async () => [
					{
						foo: 'eins',
						bar: 1.1,
					},
				],
				hello: async () => [
					{
						hello: 'zwei',
						world: 1.2,
					},
				],
				stub: async () => [
					{
						id: 'fier',
						otherId: 'funf',
					},
				],
			}),
		);
	});

	describe('toGraphQL', function () {
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

			expect(graphql.toString()).to.equal(
				`scalar Date
type s1 {
	foo: ID!
	bar: Float
}
type s2 {
	hello: ID!
	world: Float
}
type s3 {
	id: ID!
	otherId: String!
	parent(hello: String, eins: String, zwei: Float): s2
	mount(foo: String): [s1]
}
type Query {
	entry(foo: String!): [s1]
	singleEntry(id: String!): s3
}`,
			);
		});
	});

	describe('toResolvers', function () {
		it('should properly define needed resolvers', async function () {
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

			const resolvers = graphql.toResolvers();

			expect(Object.keys(resolvers)).to.deep.equal(['s3', 'Query']);

			expect(resolvers['s1']).to.equal(undefined);

			expect(Object.keys(resolvers['s3'])).to.deep.equal([
				'parent',
				'mount',
			]);

			expect(Object.keys(resolvers['Query'])).to.deep.equal([
				'entry',
				'singleEntry',
			]);

			expect(await resolvers['Query']['entry']({}, {})).to.deep.equal([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);

			expect(
				await resolvers['Query']['singleEntry']({}, {}),
			).to.deep.equal({
				id: 'fier',
				otherId: 'funf',
			});

			expect(await resolvers['s3']['parent']({}, {})).to.deep.equal({
				hello: 'zwei',
				world: 1.2,
			});

			expect(await resolvers['s3']['mount']({}, {})).to.deep.equal([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);
		});
	});

	describe('apollo server', function () {
		let server;

		beforeEach(function () {
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

			server = new ApolloServer<BaseContext>({
				typeDefs: graphql.toString(),
				resolvers: graphql.toResolvers(),
				// plugins
			});
		});

		it('should work for single', async function () {
			const response = await server.executeOperation({
				query: `query Search($id: String!) { 
                    singleEntry(id: $id) {
                        id,
						otherId,
						parent {
							hello,
							world
						},
						mount {
							foo,
							bar
						}
                    }
                }`,
				variables: {id: 'someId'},
			});

			assert(response.body.kind === 'single');
			expect(response.body.singleResult.data.singleEntry).to.deep.equal({
				id: 'fier',
				otherId: 'funf',
				parent: {hello: 'zwei', world: 1.2},
				mount: [{foo: 'eins', bar: 1.1}],
			});
		});

		it('should work for multiple', async function () {
			const response = await server.executeOperation({
				query: `query Search($id: String!) { 
                    entry(foo: $id) {
                        foo,
						bar
                    }
                }`,
				variables: {id: 'someId'},
			});

			assert(response.body.kind === 'single');
			expect(response.body.singleResult.data.entry).to.deep.equal([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);
		});
	});
});
