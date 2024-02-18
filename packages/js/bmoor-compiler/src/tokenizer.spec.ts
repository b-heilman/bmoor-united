import {expect} from 'chai';

import {Tokenizer} from './tokenizer';
import {Pattern} from './tokenizer/pattern';
import {TokenizerState} from './tokenizer/state';
import {Token} from './tokenizer/token';

describe('@bmoor/compiler', function () {
	describe('Tokenizer', function () {
		class TestToken extends Token {
			toExpressable() {
				return null;
			}

			getReference() {
				return this.settings.subType;
			}
		}

		class TestProto extends Pattern {
			begin: string;
			end: string;

			constructor(begin: string, end: string) {
				super();

				this.begin = begin;
				this.end = end;
			}

			open(str: string, pos: number) {
				const compare = str.substring(
					pos - this.begin.length + 1,
					pos + 1,
				);

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
					base.substring(state.begin, state.end + this.end.length - 1),
					state,
					{
						subType: this.begin + ':' + this.end,
					},
				);
			}

			getReference() {
				return this.begin + '::' + this.end;
			}
		}

		it('properly parses', async function () {
			const tokenizer = new Tokenizer([
				new TestProto('|', '|'),
				new TestProto('{', '}'),
				new TestProto('${', '}'),
			]);

			const tokens = tokenizer.tokenize('{ok} |foo|${bar}');

			expect(tokens.map((token) => token.content)).to.deep.equal([
				'ok',
				'foo',
				'bar',
			]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'{:}',
				'|:|',
				'{:}',
			]);
		});

		it('properly parses with order mattering', async function () {
			const tokenizer = new Tokenizer([
				new TestProto('|', '|'),
				new TestProto('${', '}'),
				new TestProto('{', '}'),
			]);

			const tokens = tokenizer.tokenize('{ok} |foo|  ${bar}');

			expect(tokens.map((token) => token.content)).to.deep.equal([
				'ok',
				'foo',
				'bar',
			]);

			expect(tokens.map((token) => token.getReference())).to.deep.equal([
				'{:}',
				'|:|',
				'${:}',
			]);
		});
	});
});
