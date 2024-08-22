import {expect} from 'chai';

import {
	BlockPattern,
	Compiler,
	RegexOpPattern,
	RegexValuePattern,
} from './index';

describe('@bmoor/compiler', function () {
	describe('Compiler', function () {
		it('should work for a basic case', function () {
			const compiler = new Compiler({
				tokenizer: [
					new RegexValuePattern(/\d/, (v) => parseInt(v), 'number'),
					new RegexOpPattern(/\+/, (a, b) => a + b, 'number'),
				],
				reducer: [],
			});

			const fn = compiler.compile('12+34+56++78');
			expect(fn()).to.equal(180);
		});

		it('should work for a block instance', function () {
			const compiler = new Compiler({
				tokenizer: [
					new RegexValuePattern(/\d/, (v) => parseInt(v), 'number'),
					new RegexOpPattern(/\+/, (a, b) => a + b, 'number'),
					new BlockPattern('(', ')'),
				],
				reducer: [],
			});

			const fn = compiler.compile('12+34+(56++78)');
			expect(fn()).to.equal(180);
		});

		it('should work with priorities', function () {
			const compiler = new Compiler({
				tokenizer: [
					new RegexValuePattern(/\d/, (v) => parseInt(v), 'number'),
					new RegexOpPattern(/\+/, (a, b) => a + b, '4-number'),
					new RegexOpPattern(/\*/, (a, b) => a * b, '3-number'),
					new BlockPattern('(', ')'),
				],
				reducer: [],
			});

			const fn = compiler.compile('12+34*(56++78)');
			expect(fn()).to.equal(4568);
		});
	});
});
