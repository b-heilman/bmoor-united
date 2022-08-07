import {expect} from 'chai';

import {parser, Parser} from './parser';
import {ParserModes} from './parser.interface';

describe('@bmoor/path', function () {
	describe('Parser', function () {
		it('should tokenize correctly', function () {
			const tokens = parser.tokenizer.tokenize(
				'hello.world["ok"].foo[1:2].bar[]'
			);

			expect(tokens.map((token) => token.toJSON())).to.deep.equal([
				{
					content: 'hello',
					settings: {},
					reference: 'accessor-token'
				},
				{
					content: 'world',
					settings: {},
					reference: 'accessor-token'
				},
				{
					content: 'ok',
					settings: {},
					reference: 'accessor-token'
				},
				{
					content: 'foo',
					settings: {},
					reference: 'accessor-token'
				},
				{
					content: '1:2',
					settings: {
						subType: 'object'
					},
					reference: 'array-token'
				},
				{
					content: 'bar',
					settings: {},
					reference: 'accessor-token'
				},
				{
					content: '',
					settings: {
						subType: 'object'
					},
					reference: 'array-token'
				}
			]);
		});
	});

	describe('parser', function () {
		describe('ParserModes.read', function () {
			it('should work with dots', function () {
				const fn = parser.getReader('foo.bar');

				expect(fn({foo: {bar: 'ok'}})).to.equal('ok');
			});

			it('should work with brackets', function () {
				const fn = parser.compile('["foo"]["bar"]');

				expect(fn({foo: {bar: 'ok'}})).to.equal('ok');
			});

			it('should work with mixed cases', function () {
				const fn = parser.compile('foo["bar"].value');

				expect(fn({foo: {bar: {value: 'ok'}}})).to.equal('ok');
			});

			describe('simple array', function () {
				it('should work with an array', function () {
					const fn = parser.compile('foo[]');

					expect(fn({foo: [1, 2]})).to.deep.equal([1, 2]);
				});

				it('should work with an array sub section beginning', function () {
					const fn = parser.compile('foo[1:]');

					expect(fn({foo: [1, 2, 3, 4]})).to.deep.equal([2, 3, 4]);
				});

				it('should work with an array sub section inside', function () {
					const fn = parser.compile('foo[1:2]');

					expect(fn({foo: [1, 2, 3, 4]})).to.deep.equal([2]);
				});

				it('should work with an array sub section ending', function () {
					const fn = parser.compile('foo[:2]');

					expect(fn({foo: [1, 2, 3, 4]})).to.deep.equal([1, 2]);
				});
			});

			describe('multi level array', function () {
				const base = {
					foo: [
						{bar: [1.1, 1.2, 1.3]},
						{bar: [2.1, 2.2, 2.3]},
						{bar: [3.1, 3.2, 3.3]},
						{bar: [4.1, 4.2, 4.3, 4.4]}
					]
				};

				it('should work with an array ', function () {
					const fn = parser.compile('foo[].bar[2:3]');

					expect(fn(base)).to.deep.equal([[1.3], [2.3], [3.3], [4.3]]);
				});

				it('should work with an array sub section ending', function () {
					const fn = parser.compile('foo[:2].bar[2:3]');

					expect(fn(base)).to.deep.equal([[1.3], [2.3]]);
				});
			});
		});

		describe('ParserModes.write', function () {
			it('should work with dots', function () {
				const fn = parser.getWriter('foo.bar');

				expect(fn({}, 'ok')).to.deep.equal({foo: {bar: 'ok'}});
			});

			it('should work with brackets', function () {
				const fn = parser.compile('["foo"]["bar"]', ParserModes.write);

				expect(fn({}, 'ok')).to.deep.equal({foo: {bar: 'ok'}});
			});

			it('should work with mixed cases', function () {
				const fn = parser.compile('foo["bar"].value', ParserModes.write);

				expect(fn({}, 'ok')).to.deep.equal({foo: {bar: {value: 'ok'}}});
			});
		});
	});
});
