import {expect} from 'chai';

import {parser, ParserModes} from './parser';

describe('@bmoor/path', function () {
	describe('parser', function () {
		describe('ParserModes.read', function () {
			it('should work with dots', function () {
				const fn = parser.compile('foo.bar');

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
		});

		describe('ParserModes.write', function () {
			it('should work with dots', function () {
				const fn = parser.compile('foo.bar', ParserModes.write);

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
