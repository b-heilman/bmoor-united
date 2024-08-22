import {expect} from 'chai';

import {Context} from './context';
import {Knowledge} from './knowledge';
import {Schema} from './schema';
import {SchemaInterface} from './schema.interface';
import {types} from './typing';
import {validations} from './validator';

describe('@bmoor/schema :: Knowledge', function () {
	let ctx;
	let knowledge: Knowledge<SchemaInterface>;

	beforeEach(function () {
		ctx = new Context(types, validations);
		knowledge = new Knowledge<SchemaInterface>();

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
