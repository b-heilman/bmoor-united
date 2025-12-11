import {expect} from 'chai';

import {Environment} from '../environment.ts';
import {FieldNeed, FieldUse} from '../field.interface.ts';
import type {SchemaInterface} from '../schema.interface.ts';
import {Schema} from '../schema.ts';
import {types} from '../typing.ts';
import {generateTypescript} from './typescript.ts';

describe('@bmoor/schema :: BuilderTypescript', function () {
	it('should properly generate a json schema', function () {
		const dictionary = new Environment<SchemaInterface>();

		dictionary.addSchema(
			new Schema(types, {
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
			new Schema(types, {
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
			new Schema(types, {
				reference: 's-3',
				info: {
					id: {
						use: FieldUse.primary,
						type: 'string',
					},
					otherId: {
						need: FieldNeed.required,
						type: 'string',
					},
					mount: {
						use: FieldUse.mount,
						type: 'array',
					},
					parent: {
						use: FieldUse.computed,
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

		expect(
			generateTypescript(dictionary.getSchema('s-3'))
				.toString()
				.replace(/\s/g, ''),
		).to.deep.equal(
			`
			interface s3 {
			id: string
			otherId: string
			parent: s2
			mount: s1[]
			}
		`.replace(/\s/g, ''),
		);
	});

	it('should properly generate a complex schema', function () {
		const dictionary = new Environment<SchemaInterface>();

		dictionary.addSchema(
			new Schema(types, {
				reference: 's-1',
				info: {
					bar: {
						type: 'string',
						use: FieldUse.primary,
					},
					world: {
						type: 'number',
						need: FieldNeed.nullable,
					},
					drei: {
						type: 'float',
						need: FieldNeed.optional,
					},
				},
				structure: [
					{
						path: 'foo.bar',
						ref: 'bar',
					},
					{
						path: 'hello.world',
						ref: 'world',
					},
					{
						path: 'eins.zwei.drei',
						ref: 'drei',
					},
				],
			}),
		);

		expect(
			generateTypescript(dictionary.getSchema('s-1'))
				.toString()
				.replace(/\s/g, ''),
		).to.deep.equal(
			`interface s1 {
				foo: s1Foo
				hello: s1Hello
				eins: s1Eins
			}
			interface s1Foo {
				bar: string
			}
			interface s1Hello {
				world: number|null
			}
			interface s1Eins {
				zwei: s1EinsZwei
			}
			interface s1EinsZwei {
				drei?: number
			}`.replace(/\s/g, ''),
		);
	});
});
