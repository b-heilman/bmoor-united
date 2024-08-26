import {ApolloServer, BaseContext} from '@apollo/server';
import {strict as assert} from 'assert';
import {expect} from 'chai';
import {stub} from 'sinon';

import {
	ModelContext,
	Model,
	EnvironmentContext,
	Service,
	ServiceAdapterInterface,
	converter,
	hooks,
	types,
} from '@bmoor/modeling';
import {validations} from '@bmoor/schema';

import {Graphql} from './graphql';

describe('@bmoor/modeling-services : graphql', function () {
	const modelCtx = new ModelContext(types, validations, hooks, converter);
	let env: EnvironmentContext;
	let adapter1: ServiceAdapterInterface;
	let adapter2: ServiceAdapterInterface;
	let adapter3: ServiceAdapterInterface;

	beforeEach(function () {
		env = new EnvironmentContext();

		adapter1 = {
			async create() {
				return [{junk: 'create - 1'}];
			},
			async read() {
				return [{junk: 'read - 1'}];
			},
			async update() {
				return [{junk: 'update - 1'}];
			},
			async delete() {
				return 0;
			},
		};

		adapter2 = {
			async create() {
				return [{junk: 'create - 2'}];
			},
			async read() {
				return [{junk: 'read - 2'}];
			},
			async update() {
				return [{junk: 'update - 2'}];
			},
			async delete() {
				return 0;
			},
		};

		adapter3 = {
			async create() {
				return [{junk: 'create - 3'}];
			},
			async read() {
				return [{junk: 'read - 3'}];
			},
			async update() {
				return [{junk: 'update - 3'}];
			},
			async delete() {
				return 0;
			},
		};

		env.addService(
			new Service(
				new Model(modelCtx, {
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

		env.addService(
			new Service(
				new Model(modelCtx, {
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
						eins: {
							type: 'string',
						},
						zwei: {
							type: 'float',
						},
					},
				},
			),
		);

		env.addService(
			new Service(
				new Model(modelCtx, {
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
			const graphql = new Graphql(modelCtx, env, {
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
			const graphql = new Graphql(modelCtx, env, {
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

			const read1 = stub(adapter1, 'read').resolves([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);

			expect(await resolvers['Query']['entry']({}, {})).to.deep.equal([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);
			expect(read1.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-1',
							fields: [
								{
									path: 'foo',
								},
								{
									path: 'bar',
								},
							],
						},
					],
				},
				params: {
					ops: [],
				},
			});
			read1.restore();

			const read2 = stub(adapter3, 'read').resolves([
				{
					id: 'fier',
					otherId: 'funf',
				},
			]);

			expect(
				await resolvers['Query']['singleEntry']({}, {}),
			).to.deep.equal({
				id: 'fier',
				otherId: 'funf',
			});
			expect(read2.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-3',
							fields: [
								{
									path: 'id',
								},
								{
									path: 'otherId',
								},
								{
									path: 'mount',
								},
								{
									path: 'parent',
								},
							],
						},
					],
				},
				params: {
					ops: [],
				},
			});
			read2.restore();

			const read3 = stub(adapter2, 'read').resolves([
				{
					hello: 'zwei',
					world: 1.2,
				},
			]);

			expect(await resolvers['s3']['parent']({}, {})).to.deep.equal({
				hello: 'zwei',
				world: 1.2,
			});
			expect(read3.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-2',
							fields: [
								{
									path: 'hello',
								},
								{
									path: 'world',
								},
							],
						},
					],
				},
				params: {
					ops: [],
				},
			});
			read3.restore();

			const read4 = stub(adapter1, 'read').resolves([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);

			expect(await resolvers['s3']['mount']({}, {})).to.deep.equal([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);
			expect(read4.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-1',
							fields: [
								{
									path: 'foo',
								},
								{
									path: 'bar',
								},
							],
						},
					],
				},
				params: {
					ops: [],
				},
			});
		});
	});

	describe('apollo server', function () {
		let server;

		beforeEach(function () {
			const graphql = new Graphql(modelCtx, env, {
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
			const read1 = stub(adapter1, 'read').resolves([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);

			const read2 = stub(adapter2, 'read').resolves([
				{
					hello: 'zwei',
					world: 1.2,
				},
			]);

			const read3 = stub(adapter3, 'read').resolves([
				{
					id: 'fier',
					otherId: 'funf',
				},
			]);

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

			expect(read1.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-1',
							fields: [
								{
									path: 'foo',
								},
								{
									path: 'bar',
								},
							],
						},
					],
				},
				params: {
					ops: [
						{
							series: 's-1',
							path: 'foo',
							operator: 'eq',
							value: 'fier',
						},
					],
				},
			});

			expect(read2.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-2',
							fields: [
								{
									path: 'hello',
								},
								{
									path: 'world',
								},
							],
						},
					],
				},
				params: {
					ops: [
						{
							series: 's-2',
							path: 'hello',
							operator: 'eq',
							value: 'funf',
						},
					],
				},
			});

			expect(read3.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-3',
							fields: [
								{
									path: 'id',
								},
								{
									path: 'otherId',
								},
								{
									path: 'mount',
								},
								{
									path: 'parent',
								},
							],
						},
					],
				},
				params: {
					ops: [
						{
							series: 's-3',
							path: 'id',
							operator: 'eq',
							value: 'someId',
						},
					],
				},
			});
		});

		it('should work for multiple', async function () {
			const read1 = stub(adapter1, 'read').resolves([
				{
					bar: 1.1,
					foo: 'eins',
				},
			]);

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

			expect(read1.getCall(0).args[1]).to.deep.equal({
				select: {
					models: [
						{
							name: 's-1',
							fields: [
								{
									path: 'foo',
								},
								{
									path: 'bar',
								},
							],
						},
					],
				},
				params: {
					ops: [
						{
							series: 's-1',
							path: 'foo',
							operator: 'eq',
							value: 'someId',
						},
					],
				},
			});
		});
	});
});
