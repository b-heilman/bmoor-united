import {expect} from 'chai';

import {format} from './format';

describe('@bmoor-string/format', function () {
	describe('format - string', function () {
		it('work with length', function () {
			expect(
				format('fooBar', {
					length: 8
				})
			).to.equal('fooBar  ');
		});

		it('work with length - align left', function () {
			expect(
				format('fooBar', {
					length: 8,
					align: 'left'
				})
			).to.equal('fooBar  ');
		});

		it('work with length - align right', function () {
			expect(
				format('fooBar', {
					length: 8,
					align: 'right'
				})
			).to.equal('  fooBar');
		});

		it('work with min length - align left', function () {
			expect(
				format('fooBar', {
					length: 4,
					align: 'left'
				})
			).to.equal('fooB');
		});

		it('work with min length - align right', function () {
			expect(
				format('fooBar', {
					length: 4,
					align: 'right'
				})
			).to.equal('oBar');
		});
	});

	describe('format - number', function () {
		it('type conversion', function () {
			expect(
				format('12345.567', {
					type: 'number',
					precision: 2
				})
			).to.equal('12345.57');
		});

		it('precision with length', function () {
			expect(
				format(12.567, {
					type: 'number',
					precision: 2,
					length: 6
				})
			).to.equal('12.57 ');
		});

		it('precision added with length', function () {
			expect(
				format(12.5, {
					type: 'number',
					precision: 2,
					length: 6
				})
			).to.equal('12.50 ');
		});

		it('length and align right', function () {
			expect(
				format(12.567, {
					type: 'number',
					align: 'right',
					length: 9
				})
			).to.equal('   12.567');
		});
	});
});
