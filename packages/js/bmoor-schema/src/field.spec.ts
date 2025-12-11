import {expect} from 'chai';

import {Field} from './field.ts';

describe('@bmoor/schema :: Field', function () {
	beforeEach(function () {});

	describe('accessing', function () {
		it('should allow you to read, if it is there', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
				},
			});

			const res = field.read({
				foo: 'bar',
			});

			expect(res).to.equal('bar');
		});

		it('should allow you to read, if it is not there', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
				},
			});

			const res = field.read({});

			expect(res).to.equal(undefined);
		});

		it('should allow you to write', async function () {
			const field = new Field({
				path: 'foo',
				info: {
					type: 'string',
				},
			});

			const res = {};
			field.write(res, 'bar');

			expect(res).to.deep.equal({
				foo: 'bar',
			});
		});
	});
});
