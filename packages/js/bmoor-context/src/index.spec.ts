import {expect} from 'chai';

import {Context} from './index';

describe('@bmoor/context', function () {
	describe('context', function () {
		it('should work', function () {
			const ctx = new Context({permissions: []});

			expect(ctx.hasPermission('foo')).to.equal(false);
		});
	});
});
