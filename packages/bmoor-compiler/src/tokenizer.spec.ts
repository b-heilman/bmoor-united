import {expect} from 'chai';

import {Tokenizer} from './tokenizer';
import {Protoken} from './tokenizer/protoken';
import {Token} from './tokenizer/token';
import {TokenizerState} from './tokenizer/state';

describe('@bmoor/compiler', function () {
	describe('Tokenizer', function () {
		class TestToken extends Token {
			toExpressable() {
				return [];
			}
		}

		class Proto extends Protoken {
			begin: string;
			end: string;

			constructor(begin: string, end: string) {
				super();

				this.begin = begin;
				this.end = end;
			}

			open(str: string, pos: number) {
				const compare = str.substring(pos - this.begin.length + 1, pos + 1);

				if (compare === this.begin) {
					return new TokenizerState(pos + 1);
				}

				return null;
			}

			close(str: string, pos: number) {
				if (str.substring(pos, pos + this.end.length) === this.end) {
					return pos;
				}

				return null;
			}

			toToken(base: string, state: TokenizerState) {
				return new TestToken(
					this.begin + ':' + this.end,
					base.substring(state.begin, state.end + this.end.length - 1),
					state
				);
			}

			getReference() {
				return this.begin + '::' + this.end;
			}
		}

		it('properly parses', async function () {
			const tokenizer = new Tokenizer([
				new Proto('|', '|'),
				new Proto('{', '}'),
				new Proto('${', '}')
			]);

			const tokens = tokenizer.tokenize('{ok} |foo|${bar}');

			expect(tokens.map((token) => token.content)).to.deep.equal([
				'ok',
				'foo',
				'bar'
			]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'{:}',
				'|:|',
				'{:}'
			]);
		});

		it('properly parses with order mattering', async function () {
			const tokenizer = new Tokenizer([
				new Proto('|', '|'),
				new Proto('${', '}'),
				new Proto('{', '}')
			]);

			const tokens = tokenizer.tokenize('{ok} |foo|  ${bar}');

			expect(tokens.map((token) => token.content)).to.deep.equal([
				'ok',
				'foo',
				'bar'
			]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'{:}',
				'|:|',
				'${:}'
			]);
		});
	});
});
