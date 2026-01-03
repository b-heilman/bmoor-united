import {expect} from 'chai';

import {Environment} from './environment.ts';
import {FieldNeed} from './field.interface.ts';
import {Schema} from './schema.ts';
import type {TypingAlias} from './typing.interface.ts';
import {types} from './typing.ts';

describe('@bmoor/schema :: Knowledge', function () {
	let knowledge: Environment<TypingAlias>;

	beforeEach(function () {
		knowledge = new Environment<TypingAlias>(types);

		knowledge.addSchema(
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
						ref: 'bar',
					},
				],
			}),
		);

		knowledge.addSchema(
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
			new Schema({
				reference: 's-3',
				info: {
					id: {
						primary: true,
						type: 'string',
					},
					otherId: {
						need: FieldNeed.required,
						type: 'string',
					},
					mount: {
						type: 'array',
					},
					parent: {
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
