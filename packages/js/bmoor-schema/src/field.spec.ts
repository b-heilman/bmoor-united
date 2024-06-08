import {expect} from 'chai';

import {Dictionary} from './dictionary';
import {Field} from './field';
import {SchemaInterface} from './schema.interface';
import {types} from './typing';
import {TypingJSON} from './typing.interface';
import {validations} from './validator';

describe('@bmoor/schema :: Field', function () {
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

			const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
				types,
				validations,
			);

			const res = await field.validate(dictionary, {
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

			const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
				types,
				validations,
			);

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

			const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
				types,
				validations,
			);

			const res = await field.validate(dictionary, {
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

			const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
				types,
				validations,
			);

			const res = await field.validate(dictionary, {
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

			const dictionary = new Dictionary<TypingJSON, SchemaInterface>(
				types,
				validations,
			);

			const res = await field.validate(dictionary, {}, 'update');

			expect(res).to.equal(null);
		});
	});
});
