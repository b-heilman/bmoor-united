import {expect} from 'chai';

import {explode, implode} from './methods';

describe('bmoor-path::methods', function () {
	describe('implode', function () {
		it('should operate correctly', function () {
			const t = {
				time: {
					start: 99,
					stop: 100,
				},
				id: 'woot',
				foo: {
					bar: {
						hello: 'world',
					},
				},
			};

			expect(implode<string | number>(t)).to.deep.equal({
				'time.start': 99,
				'time.stop': 100,
				id: 'woot',
				'foo.bar.hello': 'world',
			});
		});

		it('should operate implode correctly - with an ignore', function () {
			const t = {
				time: {
					start: 99,
					stop: 100,
				},
				id: 'woot',
				foo: {
					bar: {
						hello: 'world',
					},
				},
			};

			expect(
				implode<string | number>(t, {
					ignore: {
						time: {
							start: true,
						},
						id: true,
						foo: true,
					},
				}),
			).to.deep.equal({
				'time.stop': 100,
			});
		});

		it('should operate implode correctly - with skipInstanceOf', function () {
			class Junk {
				value: number;

				constructor() {
					this.value = 1;
				}
			}

			class Another {
				value: number;

				constructor() {
					this.value = 2;
				}
			}

			class Ok {
				value: number;

				constructor() {
					this.value = 3;
				}
			}

			const junk = new Junk();
			const another = new Another();
			const ok = new Ok();
			const t = {
				hello: 'world',
				foo: {
					bar: 'ok',
					eins: junk,
				},
				zwei: another,
				drei: ok,
			};

			expect(
				implode<string | number | Another | Junk>(t, {
					skipInstanceOf: [Another, Junk],
				}),
			).to.deep.equal({
				hello: 'world',
				'foo.bar': 'ok',
				'foo.eins': junk,
				zwei: another,
				'drei.value': 3,
			});
		});

		it('should parse a simple array', function () {
			const t = {
				time: [
					{
						start: 99,
						stop: 100,
					},
				],
				id: ['woot'],
				foo: [[{bar: 'hello'}]],
			};

			expect(implode<string | number>(t)).to.deep.equal({
				'time[].start': 99,
				'time[].stop': 100,
				'id[]': 'woot',
				'foo[][].bar': 'hello',
			});
		});
	});

	describe('explode', function () {
		it('should operate explode correctly', function () {
			const t = {
				'eins.zwei': 12,
				'eins.drei': 13,
				fier: 4,
			};

			expect(explode(t)).to.deep.equal({
				eins: {
					zwei: 12,
					drei: 13,
				},
				fier: 4,
			});
		});

		it('should operate explode correctly', function () {
			const t = {
				'eins[].zwei': [12],
				'eins[].drei': [13],
				'fier[][].value': [[4]],
			};

			expect(explode(t)).to.deep.equal({
				eins: [
					{
						zwei: 12,
						drei: 13,
					},
				],
				fier: [[{value: 4}]],
			});
		});
	});
});
