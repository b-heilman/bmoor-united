import {ApolloServer, BaseContext} from '@apollo/server';
import {strict as assert} from 'assert';
import {expect} from 'chai';

import {
	Context,
	Model,
	Nexus,
	Service,
	ServiceAdapterInterface,
	converter,
	hooks,
	types,
} from '@bmoor/modeling';
import {validations} from '@bmoor/schema';

import {Graphql} from './graphql';

describe('@bmoor/modeling-services : graphql', function () {
	const serverCtx = new Context(types, validations, hooks, converter);
	let nexus: Nexus;
	let adapter1: ServiceAdapterInterface;
	let adapter2: ServiceAdapterInterface;
	let adapter3: ServiceAdapterInterface;

	beforeEach(function () {
		nexus = new Nexus();

		adapter1 = {
			async create(ctx, content) {
				return content;
			},
			async read(ctx, content) {
				return content;
			},
			async update(ctx, content) {
				return content;
			},
			async delete(ctx, ids) {
				return ids.length;
			},
			async select(/*ctx, selector*/) {
				return [
					{
						foo: 'eins',
						bar: 1.1,
					},
				];
			},
			async search(/*ctx, search*/) {
				return [];
			},
		};

		adapter2 = {
			async create(ctx, content) {
				return content;
			},
			async read(ctx, content) {
				return content;
			},
			async update(ctx, content) {
				return content;
			},
			async delete(ctx, ids) {
				return ids.length;
			},
			async select(/*ctx, selector*/) {
				return [
					{
						hello: 'zwei',
						world: 1.2,
					},
				];
			},
			async search(/*ctx, search*/) {
				return [];
			},
		};

		adapter3 = {
			async create(ctx, content) {
				return content;
			},
			async read(ctx, content) {
				return content;
			},
			async update(ctx, content) {
				return content;
			},
			async delete(ctx, ids) {
				return ids.length;
			},
			async select(/*ctx, selector*/) {
				return [
					{
						id: 'fier',
						otherId: 'funf',
					},
				];
			},
			async search(/*ctx, search*/) {
				return [];
			},
		};

		nexus.addService(
			new Service(
				new Model(serverCtx, {
					reference: 's-1',
					info: {
						foo: {
							use: 'primary',
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
							ref: 'bar',
						},
					],
				}),
				{
					adapter: adapter1,
				},
			),
		);

		nexus.addService(
			new Service(
				new Model(serverCtx, {
					reference: 's-2',
					info: {
						hello: {
							use: 'primary',
							type: 'string',
						},
						world: {
							type: 'number',
						},
					},
					structure: [
						{
							path: 'hello',
							ref: 'hello',
						},
						{
							path: 'world',
							ref: 'world',
						},
					],
				}),
				{
					adapter: adapter2,
					actions: {
						eins: 'string',
						zwei: 'float',
					},
				},
			),
		);

		nexus.addService(
			new Service(
				new Model(serverCtx, {
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
							path: 'id',
							ref: 'id',
						},
						{
							path: 'otherId',
							ref: 'otherId',
						},
						{
							path: 'mount',
							ref: 'mount',
						},
						{
							path: 'parent',
							ref: 'parent',
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
				{
					adapter: adapter3,
				},
			),
		);
	});

	describe('toGraphQL', function () {
		it('should properly generate graphql', function () {
			const graphql = new Graphql(serverCtx, nexus, {
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
			const graphql = new Graphql(serverCtx, nexus, {
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
			const graphql = new Graphql(serverCtx, nexus, {
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
