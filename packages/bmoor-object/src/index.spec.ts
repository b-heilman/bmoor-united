import {expect} from 'chai';
import {
	DynamicObject,
	parsePath,
	set,
	makeSetter,
	get,
	makeGetter,
	del,
	explode
} from './index';

describe('@bmoor/object', function () {
	describe('parsePath', function () {
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

	describe('get', function () {
		it('should be working', function () {
			const t = {
				eins: 1,
				zwei: {
					drei: 3
				}
			};

			expect(get(t, 'eins')).to.equal(1);
			expect(get(t, 'zwei.drei')).to.equal(3);
		});

		it('should be working with empty strings', function () {
			const t = {
				eins: 1,
				zwei: {
					drei: 3
				}
			};

			expect(get(t, '')).to.equal(null);
		});

		it('should not allow __proto__', function () {
			const t = get({}, '__proto__');

			expect(t).to.equal(null);
		});
	});

	describe('makeGetter', function () {
		it('should be working', function () {
			const t = {
				eins: 1,
				zwei: {
					drei: 3
				}
			};
			const f1 = makeGetter<number>('eins');
			const f2 = makeGetter<number>('zwei.drei');

			expect(f1(t)).to.equal(1);
			expect(f2(t)).to.equal(3);
		});

		it('should fail with __proto__', function () {
			let failed = false;

			try {
				makeGetter('__proto__.polluted');
			} catch (ex) {
				failed = true;
			}

			expect(failed).to.equal(true);
		});

		it('should work with empty strings', function () {
			const f1 = makeGetter<number>('');

			expect(f1).to.equal(null);
		});
	});

	describe('set + get', function () {
		it('should allow setting a variable and getting it back', function () {
			const t = <DynamicObject<number>>{};

			set<number>(t, 'zwei.drei', 3);

			expect(get<number>(t, 'zwei.drei')).to.equal(3);
		});
	});

	describe('makeSetter + makeGetter', function () {
		it('should allow setting a variable and getting it back', function () {
			const setter = makeSetter<number>('zwei.drei');
			const getter = makeGetter<number>('zwei.drei');

			const t = <DynamicObject<number>>{};

			setter(t, 3);

			expect(getter(t)).to.equal(3);
		});
	});

	describe('del', function () {
		it('should work', function () {
			const t = {
				eins: 1,
				zwei: {
					drei: 3
				}
			};

			expect(del(t, 'eins')).to.equal(1);
			expect(del(t, 'zwei.drei')).to.equal(3);
			expect(t.eins).to.not.exist;
			expect(t.zwei).to.exist;
			expect(t.zwei.drei).to.not.exist;
		});
	});

	describe('explode', function () {
		it('should operate explode correctly', function () {
			const t = {
				'eins.zwei': 12,
				'eins.drei': 13,
				fier: 4
			};

			expect(explode<number>(t)).to.deep.equal({
				eins: {
					zwei: 12,
					drei: 13
				},
				fier: 4
			});
		});
	});

	/*
	describe('explode', function () {
		it('should operate makeExploder correctly', function () {
			const t = {
				'eins.zwei': 12,
				'eins.drei': 13,
				fier: 4
			};
			const fn = makeExploder(Object.keys(t));

			expect(explode(t)).to.deep.equal({
				eins: {
					zwei: 12,
					drei: 13
				},
				fier: 4
			});
		});
	});
	*/
});
