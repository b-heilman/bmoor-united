import {expect} from 'chai';

import {Mapping} from './mapping';

describe('@bmoor/mappings', function () {
	describe('simple object transformations', function () {
		const mappings = new Mapping([
			{
				from: 'foo',
				to: 'bar'
			},
			{
				from: 'hello',
				to: 'world'
			},
			{
				from: 'property.eins',
				to: 'aField.dis'
			},
			{
				from: 'property.zwei',
				to: 'aField.dat'
			}
		]);

		it('should read correctly', function () {
			expect(
				mappings.read(
					{},
					{
						foo: 1,
						hello: '2',
						property: {
							eins: 3,
							zwei: 4
						}
					}
				)
			).to.deep.equal({
				p0: 1,
				p1: '2',
				p2: 3,
				p3: 4
			});
		});

		it('should write correctly', function () {
			expect(
				mappings.write(
					{},
					{
						p0: 1,
						p1: '2',
						p2: 3,
						p3: 4
					}
				)
			).to.deep.equal({
				bar: 1,
				world: '2',
				aField: {
					dis: 3,
					dat: 4
				}
			});
		});

		it('should map correctly', function () {
			expect(
				mappings.map(
					{},
					{
						foo: 1,
						hello: '2',
						property: {
							eins: 3,
							zwei: 4
						}
					}
				)
			).to.deep.equal({
				bar: 1,
				world: '2',
				aField: {
					dis: 3,
					dat: 4
				}
			});
		});

		it('should transform correctly', function () {
			expect(
				mappings.transform({
					foo: 1,
					hello: '2',
					property: {
						eins: 3,
						zwei: 4
					}
				})
			).to.deep.equal({
				bar: 1,
				world: '2',
				aField: {
					dis: 3,
					dat: 4
				}
			});
		});
	});

	describe('single dimensional arrays', function () {
		xit('should work', function () {
			expect(1).to.equal(2);
		});
	});

	describe('single dimensional arrays', function () {
		xit('should work', function () {
			expect(1).to.equal(2);
		});
	});
});
