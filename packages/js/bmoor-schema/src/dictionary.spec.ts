import {expect} from 'chai';

import {Dictionary} from './dictionary';
import {Schema} from './schema';
import {SchemaInterface} from './schema.interface';
import {types} from './typing';
import {TypingJSON} from './typing.interface';
import {validations} from './validator';

describe('@bmoor/schema :: Dictionary', function () {
	let dictionary: Dictionary<TypingJSON, SchemaInterface>;

	beforeEach(function () {
		dictionary = new Dictionary<TypingJSON, SchemaInterface>(
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
						ref: 'bar',
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
		const ref2 = dictionary.getSchema('s-2').getReference();

		expect(ref2).to.deep.equal('s-2');
	});
});
