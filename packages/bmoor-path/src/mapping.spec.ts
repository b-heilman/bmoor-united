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
		const mappings = new Mapping([
			{
				from: 'foo[].bar',
				to: 'hello[].world'
			},
			{
				from: 'foo[].eins',
				to: 'hello[].zwei'
			},
			{
				from: 'foo[].other[].value',
				to: 'flat[][]'
			},
			// I'm not supporting merging arrays right now
			// from: foo[].dis
			// to: world[].some
			// ,
			// from: bar[].dat
			// to: world[].thing
			{
				from: 'bar[]',
				to: 'world[].value'
			}
		]);

		it('should read correctly', function () {
			const res = mappings.read(
				{},
				{
					foo: [
						{
							bar: 'v-1-1',
							eins: 'v-1-2',
							other: [
								{
									value: 'v-1-3'
								}
							]
						},
						{
							bar: 'v-2-1',
							eins: 'v-2-2',
							other: [
								{
									value: 'v-2-3'
								}
							]
						},
						{
							bar: 'v-3-1',
							eins: 'v-3-2',
							other: [
								{
									value: 'v-3-3'
								}
							]
						}
					],
					bar: [1, 2, 3]
				}
			);

			expect(res).to.deep.equal({
				p0_1: [
					{
						p0: 'v-1-1',
						p1: 'v-1-2',
						p2_3: [
							{
								p2: 'v-1-3'
							}
						]
					},
					{
						p0: 'v-2-1',
						p1: 'v-2-2',
						p2_3: [
							{
								p2: 'v-2-3'
							}
						]
					},
					{
						p0: 'v-3-1',
						p1: 'v-3-2',
						p2_3: [
							{
								p2: 'v-3-3'
							}
						]
					}
				],
				p3: [1, 2, 3]
			});
		});
	});

	describe('single dimensional arrays', function () {
		xit('should work', function () {
			expect(1).to.equal(2);
		});
	});
});
