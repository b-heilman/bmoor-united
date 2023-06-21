import {expect} from 'chai';

import {OrderedMap} from './index';

describe('@bmoor/index', function () {
	describe('OrderedMap', function () {
		it('should work correctly', async function () {
			const om = new OrderedMap<number, string>();

			om.setNode(1, 'eins');
			om.setNode(2, 'zwei');
			om.setNode(3, 'drei');
			om.setNode(4, 'fier');
			om.setNode(5, 'funf');

			expect(om.getNode(1)).to.equal('eins');

			expect(om.getTagsBetween(2, 4)).to.deep.equal([2, 3, 4]);

			expect(om.getTagsBetween(4, 2)).to.deep.equal([4, 3, 2]);
		});

		it('should allow offsets', async function () {
			const om = new OrderedMap<number, string>();

			om.setNode(1, 'eins');
			om.setNode(2, 'zwei');
			om.setNode(3, 'drei');
			om.setNode(4, 'fier');
			om.setNode(5, 'funf');

			expect(om.getTagOffset(3, -2)).to.equal(1);
			expect(om.getTagOffset(3, 2)).to.equal(5);
			expect(om.getTagOffset(3, 0)).to.equal(3);
			expect(om.getTagOffset(3, -20, true)).to.equal(1);
			expect(om.getTagOffset(3, 20, true)).to.equal(5);
		});
	});
});
