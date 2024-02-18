import {expect} from 'chai';

import {parser} from './parser';
import {ParserModes} from './parser.interface';

describe('@bmoor/path', function () {
	describe('Parser', function () {
		it('should tokenize correctly', function () {
			const tokens = parser.tokenizer.tokenize(
				'hello.world["ok"].foo[1:2].bar[]',
			);

			expect(tokens.map((token) => token.toJSON())).to.deep.equal([
				{
					content: 'hello',
					settings: {},
					reference: 'accessor-token',
				},
				{
					content: 'world',
					settings: {},
					reference: 'accessor-token',
				},
				{
					content: 'ok',
					settings: {},
					reference: 'accessor-token',
				},
				{
					content: 'foo',
					settings: {},
					reference: 'accessor-token',
				},
				{
					content: '1:2',
					settings: {
						subType: 'object',
					},
					reference: 'array-token',
				},
				{
					content: 'bar',
					settings: {},
					reference: 'accessor-token',
				},
				{
					content: '',
					settings: {
						subType: 'object',
					},
					reference: 'array-token',
				},
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

			it('should handle an undefined read', function () {
				const fn = parser.compile('foo["bar"].value');

				expect(fn({})).to.equal(undefined);
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
						{bar: [4.1, 4.2, 4.3, 4.4]},
					],
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
				const tgt = {};

				fn(tgt, 'ok');

				expect(tgt).to.deep.equal({foo: {bar: 'ok'}});
			});

			it('should work with brackets', function () {
				const fn = parser.compile('["foo"]["bar"]', ParserModes.write);
				const tgt = {};

				fn(tgt, 'ok');

				expect(tgt).to.deep.equal({foo: {bar: 'ok'}});
			});

			it('should work with mixed cases', function () {
				const fn = parser.compile('foo["bar"].value', ParserModes.write);
				const tgt = {};

				fn(tgt, 'ok');

				expect(tgt).to.deep.equal({foo: {bar: {value: 'ok'}}});
			});

			it('should not copy undefined', function () {
				const fn = parser.compile('foo["bar"].value', ParserModes.write);
				const tgt = {};

				fn(tgt, undefined);

				expect(tgt).to.deep.equal({});
			});

			describe('simple array', function () {
				it('should work with an array', function () {
					const fn = parser.getWriter('foo[]');
					const tgt = {};

					fn(tgt, [1, 2, 3]);

					expect(tgt).to.deep.equal({
						foo: [1, 2, 3],
					});
				});

				it('should map into an existing array', function () {
					const fn = parser.getWriter('foo[]');
					const arr = [9, 8, 7, 6];
					const tgt = {foo: arr};

					fn(tgt, [1, 2, 3]);

					expect(tgt).to.deep.equal({
						foo: [1, 2, 3, 6],
					});
				});

				it('should work with an array ignoring any op', function () {
					const fn = parser.getWriter('foo[1:2]');
					const tgt = {};

					fn(tgt, [1, 2, 3]);

					expect(tgt).to.deep.equal({
						foo: [1, 2, 3],
					});
				});
			});

			describe('multi dimensions', function () {
				it('should work with paths', function () {
					const fn = parser.getWriter('foo[1:2].bar[]');
					const tgt = {};

					fn(tgt, [
						[1, 1.1],
						[2, 2.1],
						[3, 3.1],
					]);

					expect(tgt).to.deep.equal({
						foo: [
							{
								bar: [1, 1.1],
							},
							{
								bar: [2, 2.1],
							},
							{
								bar: [3, 3.1],
							},
						],
					});
				});

				it('should work with back to back', function () {
					const fn = parser.getWriter('foo[1:2][]');
					const tgt = {};

					fn(tgt, [
						[1, 1.1],
						[2, 2.1],
						[3, 3.1],
					]);

					expect(tgt).to.deep.equal({
						foo: [
							[1, 1.1],
							[2, 2.1],
							[3, 3.1],
						],
					});
				});

				it('should work with an array as root', function () {
					const fn = parser.getWriter('[].bar[]');
					const tgt = [];

					fn(tgt, [
						[1, 1.1],
						[2, 2.1],
						[3, 3.1],
					]);

					expect(tgt).to.deep.equal([
						{
							bar: [1, 1.1],
						},
						{
							bar: [2, 2.1],
						},
						{
							bar: [3, 3.1],
						},
					]);
				});

				it('should work in the third dimension', function () {
					const fn = parser.getWriter('foo[1:2].bar[].helloWorld[]');
					const tgt = {};

					fn(tgt, [
						[
							[1, 1.1],
							[2, 2.1],
						],
						[[3, 3.1]],
					]);

					expect(tgt).to.deep.equal({
						foo: [
							{
								bar: [
									{
										helloWorld: [1, 1.1],
									},
									{
										helloWorld: [2, 2.1],
									},
								],
							},
							{
								bar: [
									{
										helloWorld: [3, 3.1],
									},
								],
							},
						],
					});
				});
			});

			it('should not collide', function () {
				const fn1 = parser.getWriter('root[].foo');
				const fn2 = parser.getWriter('root[].bar');

				const tgt = {};

				fn1(tgt, [1, 2]);
				fn2(tgt, [10, 20]);

				expect(tgt).to.deep.equal({
					root: [
						{
							foo: 1,
							bar: 10,
						},
						{
							foo: 2,
							bar: 20,
						},
					],
				});
			});
		});
	});
});
