import {expect} from 'chai';

import {Linker} from './linker.js';
import  {Mapper} from './mapper.js';

describe('@bmoor/graph - network/linker', function () {
	it('should work with a linear path', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-4', 3).map((t) => t.ref)).to.deep.equal([
			'table-1',
			'table-2',
			'table-3',
			'table-4'
		]);
	});

	it('should not search further than it needs to', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-3', 3).map((t) => t.ref)).to.deep.equal([
			'table-1',
			'table-2',
			'table-3'
		]);
	});

	it('should respect the limit - 2', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-4', 2)).to.equal(null);
	});

	it('should respect the limit - 1', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-3', 1)).to.deep.equal([]);
	});

	it('should work with the limit - 1', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-2', 1).map((t) => t.ref)).to.deep.equal([
			'table-1',
			'table-2'
		]);
	});

	it('should pick the shortest route', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');
		mapper.addLink('table-1', 'id', 'table-4', 'eins');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-4', 3).map((t) => t.ref)).to.deep.equal([
			'table-1',
			'table-4'
		]);
	});

	it('should pick the shortest route - again', function () {
		const mapper = new Mapper();

		mapper.addLink('table-1', 'id', 'table-2', 'eins');
		mapper.addLink('table-2', 'id', 'table-3', 'zwei');
		mapper.addLink('table-3', 'id', 'table-4', 'drei');
		mapper.addLink('table-2', 'id', 'table-4', 'zwei');

		const linker = new Linker(mapper, 'table-1');

		expect(linker.search('table-4', 3).map((t) => t.ref)).to.deep.equal([
			'table-1',
			'table-2',
			'table-4'
		]);
	});

	describe('with block', function () {
		it('should fail if blocking', function () {
			const mapper = new Mapper();

			mapper.addLink('table-1', 'id', 'table-2', 'eins');
			mapper.addLink('table-2', 'id', 'table-3', 'zwei');
			mapper.addLink('table-3', 'id', 'table-4', 'drei');
			mapper.addLink('table-2', 'id', 'table-4', 'zwei');

			const linker = new Linker(mapper, 'table-1');

			expect(
				linker.search('table-4', 3, {
					block: ['table-2']
				})
			).to.equal(null);
		});

		it('should pick the shortest route - again', function () {
			const mapper = new Mapper();

			mapper.addLink('table-1', 'id', 'table-2', 'eins');
			mapper.addLink('table-2', 'id', 'table-3', 'zwei');
			mapper.addLink('table-3', 'id', 'table-4', 'drei');
			mapper.addLink('table-2', 'id', 'table-4', 'zwei');
			mapper.addLink('table-4', 'id', 'table-5', 'fier');
			mapper.addLink('table-1', 'id', 'table-5', 'eins');

			const linker = new Linker(mapper, 'table-1');

			expect(
				linker
					.search('table-3', 3, {
						block: ['table-2']
					})
					.map((t) => t.ref)
			).to.deep.equal(['table-1', 'table-5', 'table-4', 'table-3']);
		});
	});

	describe('with allowed', function () {
		it('should link correctly in the short way', function () {
			const mapper = new Mapper();

			mapper.addLink('table-1', 'id', 'table-2', 'eins');
			mapper.addLink('table-2', 'id', 'table-3', 'zwei');
			mapper.addLink('table-3', 'id', 'table-4', 'drei');
			mapper.addLink('table-2', 'id', 'table-4', 'zwei');
			mapper.addLink('table-4', 'id', 'table-5', 'fier');
			mapper.addLink('table-1', 'id', 'table-5', 'eins');

			const linker = new Linker(mapper, 'table-1');

			expect(
				linker
					.search('table-3', 3, {
						allowed: {
							'table-3': {
								'table-2': true,
								'table-4': false
							}
						}
					})
					.map((t) => t.ref)
			).to.deep.equal(['table-1', 'table-2', 'table-3']);
		});

		it('should link correctly in the middle way', function () {
			const mapper = new Mapper();

			mapper.addLink('table-1', 'id', 'table-2', 'eins');
			mapper.addLink('table-2', 'id', 'table-3', 'zwei');
			mapper.addLink('table-3', 'id', 'table-4', 'drei');
			mapper.addLink('table-2', 'id', 'table-4', 'zwei');
			mapper.addLink('table-4', 'id', 'table-5', 'fier');
			mapper.addLink('table-1', 'id', 'table-5', 'eins');

			const linker = new Linker(mapper, 'table-1');

			expect(
				linker
					.search('table-3', 3, {
						allowed: {
							'table-3': {
								'table-2': false,
								'table-4': true
							},
							'table-2': {
								'table-1': true
							}
						}
					})
					.map((t) => t.ref)
			).to.deep.equal(['table-1', 'table-2', 'table-4', 'table-3']);
		});

		it('should link correctly in the long way', function () {
			const mapper = new Mapper();

			mapper.addLink('table-1', 'id', 'table-2', 'eins');
			mapper.addLink('table-2', 'id', 'table-3', 'zwei');
			mapper.addLink('table-3', 'id', 'table-4', 'drei');
			mapper.addLink('table-2', 'id', 'table-4', 'zwei');
			mapper.addLink('table-4', 'id', 'table-5', 'fier');
			mapper.addLink('table-1', 'id', 'table-5', 'eins');

			const linker = new Linker(mapper, 'table-1');

			expect(
				linker
					.search('table-3', 3, {
						allowed: {
							'table-3': {
								'table-2': false,
								'table-4': true
							},
							'table-2': {
								'table-1': false
							}
						}
					})
					.map((t) => t.ref)
			).to.deep.equal(['table-1', 'table-5', 'table-4', 'table-3']);
		});
	});
});
