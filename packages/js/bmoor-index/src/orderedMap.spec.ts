import {expect} from 'chai';

import {OrderedMap} from './index.ts';

describe('@bmoor/index', function () {
	describe('OrderedMap', function () {
		it('should work correctly', async function () {
			const om = new OrderedMap<number, string>();

			om.set(1, 'eins');
			om.set(2, 'zwei');
			om.set(3, 'drei');
			om.set(4, 'fier');
			om.set(5, 'funf');

			expect(om.get(1)).to.equal('eins');

			expect(om.getTagsBetween(2, 4)).to.deep.equal([2, 3, 4]);

			expect(om.getTagsBetween(4, 2)).to.deep.equal([4, 3, 2]);
		});

		it('should allow offsets', async function () {
			const om = new OrderedMap<number, string>();

			om.set(1, 'eins');
			om.set(2, 'zwei');
			om.set(3, 'drei');
			om.set(4, 'fier');
			om.set(5, 'funf');

			expect(om.getTagOffset(3, -2)).to.equal(1);
			expect(om.getTagOffset(3, 2)).to.equal(5);
			expect(om.getTagOffset(3, 0)).to.equal(3);
			expect(om.getTagOffset(3, -20, true)).to.equal(1);
			expect(om.getTagOffset(3, 20, true)).to.equal(5);
		});
	});
});
