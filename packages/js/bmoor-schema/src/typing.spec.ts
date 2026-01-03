import {expect} from 'chai';

import type {TypingAlias} from './typing.interface.ts';
import {types} from './typing.ts';

interface ExtendedTypingAlias extends TypingAlias {
	junk: string;
}

describe('bmoor-schema :: typing', function () {
	beforeEach(function () {});

	describe('extending', function () {
		it('should work', function () {
			const subtypes = types.extend<ExtendedTypingAlias>({
				string: {
					junk: '--junk--',
				},
			});

			expect('junk' in types.getType('string').alias).to.equal(false);

			expect(subtypes.getType('string').alias.junk).to.equal('--junk--');
		});
	});
});
