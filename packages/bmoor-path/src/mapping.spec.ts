import {expect} from 'chai';
import {beforeEach} from 'mocha';

import {Mapping} from './mapping';

describe('@bmoor/path - mapping', function () {
	describe('simple object transformations', function () {
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
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
		});

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
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
				{
					from: 'foo[].bar',
					to: 'hello[].world'
				},
				{
					from: 'foo[].eins',
					to: 'hello[].zwei'
				},
				{
					from: 'foo[].eins',
					to: 'flat[]'
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
		});

		it('should read correctly', function () {
			const res = mappings.read(
				{},
				{
					foo: [
						{
							bar: 'v-1-1',
							eins: 'v-1-2'
						},
						{
							bar: 'v-2-1',
							eins: 'v-2-2'
						},
						{
							bar: 'v-3-1',
							eins: 'v-3-2'
						}
					],
					bar: [1, 2, 3]
				}
			);

			expect(res).to.deep.equal({
				p0_0: [
					{
						p0: 'v-1-1',
						p1: 'v-1-2'
					},
					{
						p0: 'v-2-1',
						p1: 'v-2-2'
					},
					{
						p0: 'v-3-1',
						p1: 'v-3-2'
					}
				],
				p3_0: [
					{
						p3: 1
					},
					{
						p3: 2
					},
					{
						p3: 3
					}
				]
			});
		});

		it('should write correctly', function () {
			const res = mappings.write(
				{},
				{
					p0_0: [
						{
							p0: 'v-1-1',
							p1: 'v-1-2'
						},
						{
							p0: 'v-2-1',
							p1: 'v-2-2'
						},
						{
							p0: 'v-3-1',
							p1: 'v-3-2'
						}
					],
					p3_0: [
						{
							p3: 1
						},
						{
							p3: 2
						},
						{
							p3: 3
						}
					]
				}
			);

			expect(res).to.deep.equal({
				hello: [
					{
						world: 'v-1-1',
						zwei: 'v-1-2'
					},
					{
						world: 'v-2-1',
						zwei: 'v-2-2'
					},
					{
						world: 'v-3-1',
						zwei: 'v-3-2'
					}
				],
				flat: ['v-1-2', 'v-2-2', 'v-3-2'],
				world: [
					{
						value: 1
					},
					{
						value: 2
					},
					{
						value: 3
					}
				]
			});
		});
	});

	describe('single dimensional arrays', function () {
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
				{
					from: 'foo[].other[].value',
					to: 'flat[][]'
				}
			]);
		});

		it('should read correctly', function () {
			const res = mappings.read(
				{},
				{
					foo: [
						{
							other: [
								{
									value: 'v-1-3'
								}
							]
						},
						{
							other: [
								{
									value: 'v-2-3'
								}
							]
						},
						{
							other: [
								{
									value: 'v-3-3'
								}
							]
						}
					]
				}
			);

			expect(res).to.deep.equal({
				p0_0: [
					{
						p0_2: [
							{
								p0: 'v-1-3'
							}
						]
					},
					{
						p0_2: [
							{
								p0: 'v-2-3'
							}
						]
					},
					{
						p0_2: [
							{
								p0: 'v-3-3'
							}
						]
					}
				]
			});
		});
	});
});
