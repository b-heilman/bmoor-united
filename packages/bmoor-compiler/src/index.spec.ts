import {expect} from 'chai';

import {Compiler} from './index';

describe('@bmoor/compiler', function () {
	it('should work', function () {
		expect(new Compiler()).to.not.equal(undefined);
	});
});
