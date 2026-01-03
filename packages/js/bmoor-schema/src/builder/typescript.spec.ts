import {expect} from 'chai';

import {Environment} from '../environment.ts';
import {FieldNeed} from '../field.interface.ts';
import {Schema} from '../schema.ts';
import {types} from '../typing.ts';
import {generateTypescript} from './typescript.ts';
import type { TypingAlias } from '../typing.interface.ts';

describe('@bmoor/schema :: BuilderTypescript', function () {
	let env: Environment<TypingAlias>;
		
	beforeEach(function () {
		env = new Environment<TypingAlias>(types);
	});
	
	it('should properly generate a json schema', function () {
		env.addSchema(
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
				],
			}),
		);

		expect(
			generateTypescript(env, env.getSchema('s-3'))
				.toString()
				.replace(/\s/g, ''),
		).to.deep.equal(
			`
			interface s3 {
			id: string
			otherId: string
			}
		`.replace(/\s/g, ''),
		);
	});

	xit('should properly generate a json schema', function () {
		env.addSchema(
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

		env.addSchema(
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

		env.addSchema(
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
						mount: 'children',
						type: 'object',
						isMany: true,
					},
					parent: {
						mount: 'parent',
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
						reference: 'children',
						type: 'toMany',
						fields: ['id'],
						other: 's-1',
						otherFields: ['foo'],
					},
				],
			}),
		);

		expect(
			generateTypescript(env, env.getSchema('s-3'))
				.toString()
				.replace(/\s/g, ''),
		).to.deep.equal(
			`
			interface s3 {
			id: string
			otherId: string
			mount: s1[]
			parent: s2
			}
		`.replace(/\s/g, ''),
		);
	});

	it('should properly generate a complex schema', function () {
		env.addSchema(
			new Schema({
				reference: 's-1',
				info: {
					bar: {
						type: 'string',
						primary: true,
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
			generateTypescript(env, env.getSchema('s-1'))
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
