import {expect} from 'chai';

import {pause} from './index.ts';

describe('@bmoor/timing', function () {
	describe('pause', function () {
		it('should work', async function () {
			const now = Date.now();

			await pause(2);

			expect(Date.now() + 2 >= now).to.equal(true);
		});
	});
});
