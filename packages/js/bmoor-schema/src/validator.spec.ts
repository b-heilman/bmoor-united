import {expect} from 'chai';

import {Environment} from './environment.ts';
import {FieldNeed} from './field.interface.ts';
import {Field} from './field.ts';
import {Schema} from './schema.ts';
import type {TypingAlias} from './typing.interface.ts';
import {types} from './typing.ts';
import {validator} from './validator.ts';

describe('@bmoor/schema :: Validator', function () {
	let env: Environment<TypingAlias>;

	beforeEach(function () {
		env = new Environment<TypingAlias>(types);

		validator.setEnvironment(env);
	});

	describe('validateField', function () {
		it('should return back nothing if fine', async function () {
			/*
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
				},
			});
			*/

			const res = await validator.validateField(
				{
					value: 'bar',
				},
				new Field({
					path: 'value',
					info: {
						type: 'string',
					},
				}),
			);

			expect(res).to.equal(null);
		});

		it('should return back a string if failed', async function () {
			const res = await validator.validateField(
				{value: 123},
				new Field({
					path: 'value',
					info: {
						type: 'string',
					},
				}),
			);

			expect(res).to.equal('is not a string');
		});

		it('should handle null and required', async function () {
			const res = await validator.validateField(
				{value: null},
				new Field({
					path: 'value',
					info: {
						type: 'string',
						need: FieldNeed.required,
					},
				}),
			);

			expect(res).to.equal('is required');
		});

		it('should handle null and optional', async function () {
			const res = await validator.validateField(
				{value: null},
				new Field({
					path: 'value',
					info: {
						type: 'string',
						need: FieldNeed.optional,
					},
				}),
			);

			expect(res).to.equal('as optional field is null');
		});

		it('should handle null and nullable', async function () {
			const res = await validator.validateField(
				{value: null},
				new Field({
					path: 'value',
					info: {
						type: 'string',
						need: FieldNeed.nullable,
					},
				}),
			);

			expect(res).to.equal(null);
		});

		it('should handle undefined and required', async function () {
			const res = await validator.validateField(
				{value: undefined},
				new Field({
					path: 'value',
					info: {
						type: 'string',
						need: FieldNeed.required,
					},
				}),
			);

			expect(res).to.equal('is required');
		});

		it('should handle undefined and optional', async function () {
			const res = await validator.validateField(
				{value: undefined},
				new Field({
					path: 'value',
					info: {
						type: 'string',
						need: FieldNeed.optional,
					},
				}),
			);

			expect(res).to.equal(null);
		});

		it('should handle undefined and nullable', async function () {
			const res = await validator.validateField(
				{value: undefined},
				new Field({
					path: 'value',
					info: {
						type: 'string',
						need: FieldNeed.nullable,
					},
				}),
			);

			expect(res).to.equal(null);
		});

		describe('array', function () {
			it('should correctly run', async function () {
				const res = await validator.validateField(
					{
						value: ['bar'],
					},
					new Field({
						path: 'value',
						info: {
							isMany: true,
							type: 'string',
						},
					}),
				);

				expect(res).to.equal(null);
			});

			it('should correctly fail without an array', async function () {
				const res = await validator.validateField(
					{
						value: 'bar',
					},
					new Field({
						path: 'value',
						info: {
							isMany: true,
							type: 'string',
						},
					}),
				);

				expect(res).to.equal('expected array');
			});

			it('should correctly fail with bad inside data', async function () {
				const res = await validator.validateField(
					{
						value: [123],
					},
					new Field({
						path: 'value',
						info: {
							isMany: true,
							type: 'string',
						},
					}),
				);

				expect(res).to.equal('is not a string');
			});
		});

		describe('string', function () {
			it('should work', async function () {
				const res = await validator.validateField(
					{value: 'hello world'},
					new Field({
						path: 'value',
						info: {
							type: 'string',
						},
					}),
				);

				expect(res).to.equal(null);
			});

			it('should work fail on number', async function () {
				const res = await validator.validateField(
					{value: 123},
					new Field({
						path: 'value',
						info: {
							type: 'string',
						},
					}),
				);

				expect(res).to.equal('is not a string');
			});
		});

		describe('number', function () {
			it('should work as int', async function () {
				const res = await validator.validateField(
					{value: 123},
					new Field({
						path: 'value',
						info: {
							type: 'number',
						},
					}),
				);

				expect(res).to.equal(null);
			});

			it('should work as float', async function () {
				const res = await validator.validateField(
					{value: 12.3},
					new Field({
						path: 'value',
						info: {
							type: 'number',
						},
					}),
				);

				expect(res).to.equal(null);
			});

			it('should work fail on number', async function () {
				const res = await validator.validateField(
					{value: 'foo bar'},
					new Field({
						path: 'value',
						info: {
							type: 'number',
						},
					}),
				);

				expect(res).to.equal('is not a number');
			});

			it('should work as integer', async function () {
				const res = await validator.validateField(
					{value: 123},
					new Field({
						path: 'value',
						info: {
							type: 'int',
						},
					}),
				);

				expect(res).to.equal(null);
			});

			it('should fail as integer with float', async function () {
				const res = await validator.validateField(
					{value: 123.2},
					new Field({
						path: 'value',
						info: {
							type: 'int',
						},
					}),
				);

				expect(res).to.equal('is not integer');
			});

			it('should work as float', async function () {
				const res = await validator.validateField(
					{value: 123.2},
					new Field({
						path: 'value',
						info: {
							type: 'float',
						},
					}),
				);

				expect(res).to.equal(null);
			});

			it('should fail as float with integer', async function () {
				const res = await validator.validateField(
					{value: 123},
					new Field({
						path: 'value',
						info: {
							type: 'float',
						},
					}),
				);

				expect(res).to.equal('is integer');
			});
		});
	});

	describe('missing validations', function () {
		it('should still work', async function () {
			const myTypes = types.clone();
			const myEnv = new Environment<TypingAlias>(myTypes);

			validator.setEnvironment(myEnv);

			myTypes.addType('missing', {
				alias: {
					json: 'junk',
					typescript: 'junk',
					python: 'junk',
				},
				info: {
					validations: ['missing'],
				},
			});

			expect(types.getType('missing')).to.equal(null);

			const res = await validator.validateField(
				{value: 'foo bar'},
				new Field({
					path: 'value',
					info: {
						type: 'missing',
					},
				}),
			);

			expect(res).to.equal(null);
		});
	});

	describe('validateSchema', function () {
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
						/**
						 * NOTE: all relationships don't need a mount point.  Some are just
						 * to let you know the relationship exists, but the nested data might
						 * not exist on the object.  Say a schema extends another, it could add
						 * the mount which the child schema requires more processing than the
						 * parent
						 */
						{
							reference: 'parent',
							type: 'toOne',
							mount: 'parent',
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
});
