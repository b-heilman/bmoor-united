import {expect} from 'chai';

import {toCamelCase, toKebabCase, toProperCase} from './cases.ts';

describe('@bmoor/string', function () {
	describe('toKebabCase', function () {
		it('should convert from camelcase', function () {
			expect(toKebabCase('fooBar')).to.equal('foo-bar');
			expect(toKebabCase('thisIsFooBar')).to.equal('this-is-foo-bar');
		});

		it('should handle white spaces', function () {
			expect(toKebabCase('foo  bar')).to.equal('foo-bar');
			expect(toKebabCase('thisIs FooBar')).to.equal('this-is-foo-bar');
		});
	});

	describe('toCamelCase', function () {
		it('should convert from skewer', function () {
			expect(toCamelCase('foo-bar')).to.equal('fooBar');
			expect(toCamelCase('this-is-foo-Bar')).to.equal('thisIsFooBar');
		});

		it('should handle white spaces', function () {
			expect(toCamelCase('foo  bar')).to.equal('fooBar');
			expect(toCamelCase('this-is FooBar')).to.equal('thisIsFooBar');
		});
	});

	describe('toProperCase', function () {
		it('should convert from skewer', function () {
			expect(toProperCase('foo-bar')).to.equal('FooBar');
			expect(toProperCase('this-is-foo-Bar')).to.equal('ThisIsFooBar');
		});
	});
});
