import {expect} from 'chai';

import {Mapping} from './index';

describe('@bmoor/path', function () {
	describe('path', function () {
		it('should work', function () {
			const mapping = new Mapping([
				{
					from: 'eins',
					to: 'field1',
				},
				{
					from: 'zwei',
					to: 'field2',
				},
			]);

			expect(mapping.transform({eins: 1, zwei: 2})).to.deep.equal({
				field1: 1,
				field2: 2,
			});
		});
	});
});
