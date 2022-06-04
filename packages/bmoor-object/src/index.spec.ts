import {expect} from 'chai';
import {parsePath} from './index';

describe('@bmoor/object', function () {
	describe('parse', function () {
		it('should parse an array correctly', function () {
			expect(parsePath(['1', '2', '3'])).to.deep.equal(['1', '2', '3']);
		});

		it('should parse dot notation correctly', function () {
			expect(parsePath('1.2.3')).to.deep.equal(['1', '2', '3']);
		});

		it('should parse brackets correctly', function () {
			expect(parsePath('[1][2][3]')).to.deep.equal(['1', '2', '3']);
		});

		it('should parse brackets with quotes correctly', function () {
			expect(parsePath('[\'1\']["2"][3]')).to.deep.equal(['1', '2', '3']);
		});

		it('should parse mixed correctly', function () {
			expect(parsePath('foo["bar"].ok[hello]')).to.deep.equal([
				'foo',
				'bar',
				'ok',
				'hello'
			]);
		});
	});
});
