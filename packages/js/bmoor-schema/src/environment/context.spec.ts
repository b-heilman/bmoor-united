import {expect} from 'chai';

import {Schema} from '../schema';
import {SchemaInterface} from '../schema.interface';
import {SchemaContext} from '../schema/context';
import {types} from '../typing';
import {validations} from '../validator';
import {EnvironmentContext} from './context';

describe('@bmoor/schema :: Knowledge', function () {
	let ctx;
	let knowledge: EnvironmentContext<SchemaInterface>;

	beforeEach(function () {
		ctx = new SchemaContext(types, validations);
		knowledge = new EnvironmentContext<SchemaInterface>();

		knowledge.addSchema(
			new Schema(ctx, {
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
						ref: 'bar',
					},
				],
			}),
		);

		knowledge.addSchema(
			new Schema(ctx, {
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
						path: 'hello',
						ref: 'hello',
					},
					{
						path: 'world',
						ref: 'world',
					},
				],
			}),
		);

		knowledge.addSchema(
			new Schema(ctx, {
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
		);
	});

	it('should allow reading', async function () {
		const ref2 = knowledge.getSchema('s-2').getReference();

		expect(ref2).to.deep.equal('s-2');
	});
});
