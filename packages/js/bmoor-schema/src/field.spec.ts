import {expect} from 'chai';

import {Field} from './field.ts';
import {SchemaContext} from './schema/context.ts';
import {TypingJSON} from './typing.interface.ts';
import {types} from './typing.ts';
import {validations} from './validator.ts';

describe('@bmoor/schema :: Field', function () {
	let ctx;

	beforeEach(function () {
		ctx = new SchemaContext<TypingJSON>(types, validations);
	});

	describe('validate', function () {
		it('should return back nothing if fine', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
				},
			});

			field.setValidator({
				reference: 'string',
			});

			const res = await field.validate(ctx, {
				foo: 'bar',
			});

			expect(res).to.equal(null);
		});

		it('should return back a string if failed', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
				},
			});

			field.setValidator({
				reference: 'string',
			});

			const dictionary = new SchemaContext<TypingJSON>(types, validations);

			const res = await field.validate(dictionary, {
				foo: 123,
			});

			expect(res).to.equal('not a string');
		});

		it('should handle null and not required', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
					required: false,
				},
			});

			field.setValidator({
				reference: 'string',
			});

			const res = await field.validate(ctx, {
				foo: null,
			});

			expect(res).to.equal('not a string');
		});

		it('should handle null and required', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
					required: true,
				},
			});

			field.setValidator({
				reference: 'string',
			});

			const res = await field.validate(ctx, {
				foo: null,
			});

			expect(res).to.equal('can not be null');
		});

		it('should handle null and required while updating', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
					required: true,
				},
			});

			field.setValidator({
				reference: 'string',
			});

			const res = await field.validate(ctx, {}, 'update');

			expect(res).to.equal(null);
		});
	});
});
