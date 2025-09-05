import {expect} from 'chai';

import {
	isArray,
	isArrayLike,
	isBoolean,
	isDefined,
	isEmpty,
	isFunction,
	isNumber,
	isObject,
	isString,
	isUndefined,
} from './index.ts';

export const results = describe('@bmoor/compare', function () {
	describe('isBoolean', function () {
		it('should be able to test booleans', function () {
			expect(isBoolean(true)).to.equal(true);
			expect(isBoolean(false)).to.equal(true);
			expect(isBoolean(1)).to.equal(false);
			expect(isBoolean(0)).to.equal(false);
		});
	});

	describe('isDefined', function () {
		it('should be able to test for variables being defined', function () {
			const n = {};

			let t;

			expect(isDefined(true)).to.equal(true);
			expect(isDefined(false)).to.equal(true);
			expect(isDefined(1)).to.equal(true);
			expect(isDefined(0)).to.equal(true);
			expect(isDefined(n)).to.equal(true);
			expect(isDefined(t)).to.equal(false);
		});
	});

	describe('isUndefined', function () {
		it('should be able to test for variables being undefined', function () {
			const n = {};

			let t;

			expect(isUndefined(true)).to.equal(false);
			expect(isUndefined(false)).to.equal(false);
			expect(isUndefined(1)).to.equal(false);
			expect(isUndefined(0)).to.equal(false);
			expect(isUndefined(n)).to.equal(false);
			expect(isUndefined(t)).to.equal(true);
		});
	});

	describe('isArray', function () {
		it('should be able to test for variables being arrays', function () {
			expect(isArray([])).to.equal(true);
			expect(isArray({})).to.equal(false);
			expect(isArray(1)).to.equal(false);
			expect(isArray({length: 0})).to.equal(false);
			expect(isArray('')).to.equal(false);
		});
	});

	describe('isArrayLike', function () {
		it('should be able to test for variables being array like', function () {
			expect(isArrayLike([])).to.equal(true);
			expect(isArrayLike({})).to.equal(false);
			expect(isArrayLike({length: 0})).to.equal(true);
		});
	});

	describe('isObject', function () {
		it('should be able to test for variables being an object', function () {
			function Temp() {
				this.value = 1 + 1;
			}
			const t = new Map();

			expect(isObject([])).to.equal(true);
			expect(isObject({})).to.equal(true);
			expect(isObject(1)).to.equal(false);
			expect(isObject(false)).to.equal(false);
			expect(isObject(Temp)).to.equal(false);
			expect(isObject(t)).to.equal(true);
			expect(isObject('')).to.equal(false);
		});
	});

	describe('isFunction', function () {
		it('should be able to test for variables being a function', function () {
			function Temp() {
				this.value = 1 + 1;
			}
			const t = new Map();

			expect(isFunction([])).to.equal(false);
			expect(isFunction({})).to.equal(false);
			expect(isFunction(1)).to.equal(false);
			expect(isFunction(false)).to.equal(false);
			expect(isFunction(Temp)).to.equal(true);
			expect(isFunction(t)).to.equal(false);
			expect(isFunction('')).to.equal(false);
		});
	});

	describe('isNumber', function () {
		it('should be able to test for variables being a number', function () {
			function Temp() {
				this.value = 1 + 1;
			}
			const t = new Map();

			expect(isNumber([])).to.equal(false);
			expect(isNumber({})).to.equal(false);
			expect(isNumber(1)).to.equal(true);
			expect(isNumber(false)).to.equal(false);
			expect(isNumber(Temp)).to.equal(false);
			expect(isNumber(t)).to.equal(false);
			expect(isNumber('')).to.equal(false);
		});
	});

	describe('isString', function () {
		it('should be able to test for variables being a function', function () {
			function Temp() {
				this.value = 1 + 1;
			}
			const t = new Map();

			expect(isString([])).to.equal(false);
			expect(isString({})).to.equal(false);
			expect(isString(1)).to.equal(false);
			expect(isString(false)).to.equal(false);
			expect(isString(Temp)).to.equal(false);
			expect(isString(t)).to.equal(false);
			expect(isString('')).to.equal(true);
		});
	});

	describe('isEmpty', function () {
		it('should be able to test for variables being a function', function () {
			let t;

			expect(isEmpty([])).to.equal(true);
			expect(isEmpty({})).to.equal(true);
			expect(isEmpty(t)).to.equal(true);
			expect(isEmpty(null)).to.equal(false);
			expect(isEmpty([0])).to.equal(false);
			expect(isEmpty({v: 0})).to.equal(false);
		});
	});
});
