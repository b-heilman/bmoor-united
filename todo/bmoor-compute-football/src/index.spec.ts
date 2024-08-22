import {expect} from 'chai';

import {graph, registry} from './index';

describe('@bmoor/compute-football', function () {
	it('should work', async function () {
		expect(graph).to.not.equal(undefined);
		expect(registry).to.not.equal(undefined);
	});
});
