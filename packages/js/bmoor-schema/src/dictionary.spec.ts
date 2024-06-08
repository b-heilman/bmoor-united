import {expect} from 'chai';

import {Connector} from './connector';
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
					reference: 'foo',
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
				connection: {
					reference: 'bar',
				},
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

		dictionary.setConnector(
			new Connector({
				foo: async () => [
					{
						eins: 1,
					},
				],
				bar: async () => [
					{
						zwei: 2,
					},
				],
			}),
		);
	});

	it('should allow reading', async function () {
		const foo = await dictionary.getSchema('s-2').read(dictionary, {});

		expect(foo).to.deep.equal([
			{
				eins: 1,
			},
		]);

		const bar = await dictionary.getSchema('s-3').read(dictionary, {
			actions: {}, // should be optional
		});

		expect(bar).to.deep.equal([
			{
				zwei: 2,
			},
		]);
	});
});
