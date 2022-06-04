import {expect} from 'chai';
import {isUndefined} from './index';

describe('@bmoor/compare', function () {
	describe('isUndefined', function () {
		it('should be able to test for variables being undefined', function () {
			const n = {};

			let t;

			expect(isUndefined(true)).to.equal(false);
			expect(isUndefined(false)).to.equal(false);
			expect(isUndefined(1)).to.equal(false);
			expect(isUndefined(0)).to.equal(false);
			expect(isUndefined(n)).to.equal(false);
			expect(isUndefined(t)).to.equal(true);
		});
	});
});
