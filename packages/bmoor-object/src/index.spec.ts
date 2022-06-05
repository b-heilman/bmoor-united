import {expect} from 'chai';
import {parsePath, set, DynamicObject, makeSetter} from './index';

describe('@bmoor/object', function () {
	describe('parse', function () {
		it('should parse an array correctly', function () {
			expect(parsePath(['1', '2', '3'])).to.deep.equal(['1', '2', '3']);
		});

		it('should parse dot notation correctly', function () {
			expect(parsePath('1.2.3')).to.deep.equal(['1', '2', '3']);
		});

		it('should parse brackets correctly', function () {
			expect(parsePath('[1][2][3]')).to.deep.equal(['1', '2', '3']);
		});

		it('should parse brackets with quotes correctly', function () {
			expect(parsePath('[\'1\']["2"][3]')).to.deep.equal(['1', '2', '3']);
		});

		it('should parse mixed correctly', function () {
			expect(parsePath('foo["bar"].ok[hello]')).to.deep.equal([
				'foo',
				'bar',
				'ok',
				'hello'
			]);
		});
	});

	describe('set', function () {
		it('should be working working', function () {
			const t = <DynamicObject<number>>{};

			set<number>(t, 'eins', 1);
			set<number>(t, 'zwei.drei', 3);

			expect(t.eins).to.equal(1);
			expect((<DynamicObject<number>>t.zwei).drei).to.equal(3);
		});

		it('should not allow __proto__', function () {
			const t = <DynamicObject<boolean>>{};

			set<boolean>(t, '__proto__.polluted', true);

			expect(t.polluted).to.not.equal(true);
		});

		it('should not allow __proto__ when in array', function () {
			const t = <DynamicObject<number | string>>{};

			set(t, ['__proto__', 'polluted'], 'polluted');

			expect(t.polluted).to.not.equal('polluted');
		});
	});

	describe('makeSetter', function () {
		it('should actually work', function () {
			const t = <DynamicObject<number | string>>{};
			const f1 = makeSetter('eins');
			const f2 = makeSetter('zwei.drei');

			f1(t, 1);
			f2(t, 3);

			expect(t.eins).to.equal(1);
			expect((<DynamicObject<number>>t.zwei).drei).to.equal(3);
		});

		it('should fail with __proto__', function () {
			let failed = false;

			try {
				makeSetter('__proto__.polluted');
			} catch (ex) {
				failed = true;
			}

			expect(failed).to.equal(true);
		});
	});
});
