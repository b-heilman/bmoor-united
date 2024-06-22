import {expect} from 'chai';

import {Dictionary} from '../dictionary';
import {Schema} from '../schema';
import {SchemaInterface} from '../schema.interface';
import {types} from '../typing';
import {TypingJSON} from '../typing.interface';
import {validations} from '../validator';
import {BuilderTypescript} from './typescript';

describe('@bmoor/schema :: BuilderTypescript', function () {
	it('should properly generate a json schema', function () {
		const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
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

		const formatter = new BuilderTypescript(dictionary);

		formatter.addSchema(dictionary.getSchema('s-3'));

		expect(formatter.toJSON()).to.deep.equal({
			id: 'string',
			otherId: 'string',
			parent: 's2',
			mount: 's1[]',
		});

		expect(formatter.toString().replace(/\s/g, '')).to.deep.equal(
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
		const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
			types,
			validations,
		);

		dictionary.addSchema(
			new Schema({
				reference: 's-1',
				info: {
					bar: {
						type: 'string',
					},
					world: {
						type: 'number',
					},
					drei: {
						type: 'float',
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

		const formatter = new BuilderTypescript(dictionary);

		formatter.addSchema(dictionary.getSchema('s-1'));

		expect(formatter.toJSON()).to.deep.equal({
			foo: {
				'bar?': 'string',
			},
			hello: {
				'world?': 'number',
			},
			eins: {
				zwei: {
					'drei?': 'number',
				},
			},
		});

		expect(formatter.toString()).to.deep.equal(
			`interface s1 {
	foo: s1Foo
	hello: s1Hello
	eins: s1Eins
}
interface s1Foo {
	bar?: string
}
interface s1Hello {
	world?: number
}
interface s1Eins {
	zwei: s1EinsZwei
}
interface s1EinsZwei {
	drei?: number
}`,
		);
	});
});
