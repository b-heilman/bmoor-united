import {expect} from 'chai';

import {Token, TokenReference} from './tokenizer/token';
import {Statement} from './reducer/statement';
import {Reducer} from './reducer';

describe('@bmoor/compiler', function () {
	describe('Reducer', function () {
		class EinsToken extends Token {
			static reference: TokenReference = 'eins';

			toExpressable() {
				return null;
			}
		}

		class ZweiToken extends Token {
			static reference: TokenReference = 'zwei';

			toExpressable() {
				return null;
			}
		}

		class DreiToken extends Token {
			static reference: TokenReference = 'drei';

			toExpressable() {
				return null;
			}
		}

		class FierToken extends Token {
			static reference: TokenReference = 'fier';

			toExpressable() {
				return null;
			}
		}

		const eins = new EinsToken('1', null, null);
		const otherEins = new EinsToken('2', null, null);
		const zwei = new ZweiToken('3', null, null);
		const drei = new DreiToken('4', null, null);
		const fier = new FierToken('5', null, null);

		class Statement1 extends Statement {
			static pieces = [EinsToken, ZweiToken];

			toExpressable() {
				return null;
			}
		}

		class Statement2 extends Statement {
			static pieces = [EinsToken, ZweiToken, DreiToken];

			toExpressable() {
				return null;
			}
		}

		class Statement3 extends Statement {
			static pieces = [EinsToken, ZweiToken, FierToken];

			toExpressable() {
				return null;
			}
		}

		it('should reduce a whole set', async function () {
			const reducer = new Reducer([Statement1, Statement2, Statement3]);

			const tokens = reducer.reduce([eins, zwei]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'compound:eins-zwei'
			]);
		});

		it('should handle left overs', async function () {
			const reducer = new Reducer([Statement1, Statement2, Statement3]);

			const tokens = reducer.reduce([eins, zwei, otherEins, drei, fier]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'compound:eins-zwei',
				'eins',
				'drei',
				'fier'
			]);
		});

		it('properly handle back to back', async function () {
			const reducer = new Reducer([Statement1, Statement2, Statement3]);

			const tokens = reducer.reduce([eins, zwei, otherEins, zwei, drei, fier]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'compound:eins-zwei',
				'compound:eins-zwei-drei',
				'fier'
			]);
		});

		it('properly handle with a gap', async function () {
			const reducer = new Reducer([Statement1, Statement2, Statement3]);

			const tokens = reducer.reduce([
				eins,
				zwei,
				drei,
				drei,
				otherEins,
				zwei,
				fier
			]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'compound:eins-zwei-drei',
				'drei',
				'compound:eins-zwei-fier'
			]);
		});
	});
});
