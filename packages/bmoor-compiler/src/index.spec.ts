import {expect} from 'chai';

import {Compiler, RegexValuePattern, RegexOpPattern} from './index';

describe('@bmoor/compiler', function () {
	describe('Compiler', function () {
		it('should work', function () {
			const compiler = new Compiler({
				tokenizer: [
					new RegexValuePattern(/\d/, (v) => parseInt(v), 'number'),
					new RegexOpPattern(/\+/, (a, b) => a + b, 'number')
				],
				reducer: []
			});

			const fn = compiler.compile('12+34+56++78');
			expect(fn()).to.equal(180);
		});
	});
});
