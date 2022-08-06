import {expect} from 'chai';

import {Token} from './tokenizer/token';
import {Statement} from './reducer/statement';
import {Expressor, ExpressorModes} from './expressor';
import {Expressable} from './expressor/expressable';
import {ExpressableUsages} from './expressor/expressable.interface';

describe('@bmoor/compiler', function () {
	describe('Expressor', function () {
		class ValueToken extends Token {
			toExpressable() {
				return new Expressable(this, ExpressableUsages.value, () =>
					parseInt(this.content)
				);
			}
		}

		class AddToken extends Token {
			toExpressable() {
				return new Expressable(
					this,
					ExpressableUsages.operation,
					(a, b) => {
						return a + b;
					},
					{rank: 4}
				);
			}
		}

		class MultToken extends Token {
			toExpressable() {
				return new Expressable(
					this,
					ExpressableUsages.operation,
					(a, b) => {
						return a * b;
					},
					{rank: 3}
				);
			}
		}

		class TestStatement extends Statement {
			toExpressable() {
				return new Expressable(
					this,
					ExpressableUsages.operation,
					(a, b) => {
						return a - b;
					},
					{rank: 4}
				);
			}
		}

		it('should work', function () {
			const eins = new ValueToken(1, null);
			const zwei = new ValueToken(2, null);
			const drei = new ValueToken(3, null);
			const add = new AddToken('+', null);
			const sub = new TestStatement([]);

			const ex = new Expressor();

			const infix = ex.express(
				[eins, add, zwei, sub, drei],
				ExpressorModes.infix
			);

			const postfix = ex.express(
				[eins, add, zwei, sub, drei],
				ExpressorModes.postfix
			);

			expect(infix.map((e) => e.usage)).to.deep.equal([
				'value',
				'operation',
				'value',
				'operation',
				'value'
			]);

			expect(postfix.map((e) => e.usage)).to.deep.equal([
				'value',
				'value',
				'operation',
				'value',
				'operation'
			]);

			expect(ex.makeExecutable([eins, add, zwei, sub, drei])()).to.deep.equal(
				0
			);
		});

		it('should consider rank', function () {
			const eins = new ValueToken(1, null);
			const zwei = new ValueToken(2, null);
			const drei = new ValueToken(3, null);
			const add = new AddToken('+', null);
			const mult = new MultToken('*', null);

			const ex = new Expressor();

			// (1+2)*3 = 9
			// 1+(2*3) = 7
			const fn = ex.makeExecutable([eins, add, zwei, mult, drei]);

			expect(fn()).to.deep.equal(7);
		});
	});
});
