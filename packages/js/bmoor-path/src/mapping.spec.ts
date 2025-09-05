import {expect} from 'chai';
import {beforeEach} from 'mocha';

import {Mapping} from './mapping.ts';

describe('@bmoor/path - mapping', function () {
	describe('simple object transformations', function () {
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
				{
					from: 'foo',
					to: 'bar',
				},
				{
					from: 'hello',
					to: 'world',
					hook: (a) => parseInt(a),
				},
				{
					from: 'property.eins',
					to: 'aField.dis',
				},
				{
					from: 'property.zwei',
					to: 'aField.dat',
				},
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
							zwei: 4,
						},
					},
				),
			).to.deep.equal({
				p0: 1,
				p1: '2',
				p2: 3,
				p3: 4,
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
						p3: 4,
					},
				),
			).to.deep.equal({
				bar: 1,
				world: 2,
				aField: {
					dis: 3,
					dat: 4,
				},
			});
		});

		it('should not write undefineds', function () {
			expect(
				mappings.write(
					{},
					{
						p0: 1,
						p3: 4,
					},
				),
			).to.deep.equal({
				bar: 1,
				aField: {
					dat: 4,
				},
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
							zwei: 4,
						},
					},
				),
			).to.deep.equal({
				bar: 1,
				world: 2,
				aField: {
					dis: 3,
					dat: 4,
				},
			});
		});

		it('should transform correctly', function () {
			expect(
				mappings.transform({
					foo: 1,
					hello: '2',
					property: {
						eins: 3,
						zwei: 4,
					},
				}),
			).to.deep.equal({
				bar: 1,
				world: 2,
				aField: {
					dis: 3,
					dat: 4,
				},
			});
		});
	});

	describe('single dimensional arrays', function () {
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
				{
					from: 'foo[].bar',
					to: 'hello[].world',
				},
				{
					from: 'foo[].eins',
					to: 'hello[].zwei',
					hook: (v) => 'z-' + v,
				},
				{
					from: 'foo[].eins',
					to: 'flat[]',
				},
				// I'm not supporting merging arrays right now
				// from: foo[].dis
				// to: world[].some
				// ,
				// from: bar[].dat
				// to: world[].thing
				{
					from: 'bar[]',
					to: 'world[].value',
				},
			]);
		});

		it('should read correctly', function () {
			const res = mappings.read(
				{},
				{
					foo: [
						{
							bar: 'v-1-1',
							eins: 'v-1-2',
						},
						{
							bar: 'v-2-1',
							eins: 'v-2-2',
						},
						{
							bar: 'v-3-1',
							eins: 'v-3-2',
						},
					],
					bar: [1, 2, 3],
				},
			);

			expect(res).to.deep.equal({
				p0_1: [
					{
						p0: 'v-1-1',
						p1: 'v-1-2',
					},
					{
						p0: 'v-2-1',
						p1: 'v-2-2',
					},
					{
						p0: 'v-3-1',
						p1: 'v-3-2',
					},
				],
				p3_1: [
					{
						p3: 1,
					},
					{
						p3: 2,
					},
					{
						p3: 3,
					},
				],
			});
		});

		it('should write correctly', function () {
			const res = mappings.write(
				{},
				{
					p0_1: [
						{
							p0: 'v-1-1',
							p1: 'v-1-2',
						},
						{
							p0: 'v-2-1',
							p1: 'v-2-2',
						},
						{
							p0: 'v-3-1',
							p1: 'v-3-2',
						},
					],
					p3_1: [
						{
							p3: 1,
						},
						{
							p3: 2,
						},
						{
							p3: 3,
						},
					],
				},
			);

			expect(res).to.deep.equal({
				hello: [
					{
						world: 'v-1-1',
						zwei: 'z-v-1-2',
					},
					{
						world: 'v-2-1',
						zwei: 'z-v-2-2',
					},
					{
						world: 'v-3-1',
						zwei: 'z-v-3-2',
					},
				],
				flat: ['v-1-2', 'v-2-2', 'v-3-2'],
				world: [
					{
						value: 1,
					},
					{
						value: 2,
					},
					{
						value: 3,
					},
				],
			});
		});

		it('should transform correctly', function () {
			const res = mappings.transform({
				foo: [
					{
						bar: 'v-1-1',
						eins: 'v-1-2',
					},
					{
						bar: 'v-2-1',
						eins: 'v-2-2',
					},
					{
						bar: 'v-3-1',
						eins: 'v-3-2',
					},
				],
				bar: [1, 2, 3],
			});

			expect(res).to.deep.equal({
				flat: ['v-1-2', 'v-2-2', 'v-3-2'],
				hello: [
					{
						world: 'v-1-1',
						zwei: 'z-v-1-2',
					},
					{
						world: 'v-2-1',
						zwei: 'z-v-2-2',
					},
					{
						world: 'v-3-1',
						zwei: 'z-v-3-2',
					},
				],
				world: [
					{
						value: 1,
					},
					{
						value: 2,
					},
					{
						value: 3,
					},
				],
			});
		});
	});

	describe('multi dimensional arrays', function () {
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
				{
					from: 'foo[][].value',
					to: 'flat[][]',
				},
				{
					from: 'foo[][].value',
					to: 'obj[][].attr',
				},
				{
					from: 'bar[][]',
					to: 'hello[][].value',
				},
				{
					from: 'bar[][]',
					to: 'world[][]',
				},
			]);
		});

		it('should read correctly', function () {
			const res = mappings.read(
				{},
				{
					foo: [
						[
							{
								value: 'v-1-3',
							},
						],
						[
							{
								value: 'v-2-3',
							},
						],
						[
							{
								value: 'v-3-3',
							},
						],
					],
					bar: [['eins', 'zwei', 'drei']],
				},
			);

			expect(res).to.deep.equal({
				p0_1: [
					{
						p0_2: [
							{
								p0: 'v-1-3',
							},
						],
					},
					{
						p0_2: [
							{
								p0: 'v-2-3',
							},
						],
					},
					{
						p0_2: [
							{
								p0: 'v-3-3',
							},
						],
					},
				],
				p2_1: [
					{
						p2_2: [
							{
								p2: 'eins',
							},
							{
								p2: 'zwei',
							},
							{
								p2: 'drei',
							},
						],
					},
				],
			});
		});

		it('should write correctly', function () {
			const res = mappings.write(
				{},
				{
					p0_1: [
						{
							p0_2: [
								{
									p0: 'v-1-3',
								},
							],
						},
						{
							p0_2: [
								{
									p0: 'v-2-3',
								},
							],
						},
						{
							p0_2: [
								{
									p0: 'v-3-3',
								},
							],
						},
					],
					p2_1: [
						{
							p2_2: [
								{
									p2: 'eins',
								},
								{
									p2: 'zwei',
								},
								{
									p2: 'drei',
								},
							],
						},
					],
				},
			);

			expect(res).to.deep.equal({
				flat: [['v-1-3'], ['v-2-3'], ['v-3-3']],
				hello: [
					[
						{
							value: 'eins',
						},
						{
							value: 'zwei',
						},
						{
							value: 'drei',
						},
					],
				],
				obj: [
					[
						{
							attr: 'v-1-3',
						},
					],
					[
						{
							attr: 'v-2-3',
						},
					],
					[
						{
							attr: 'v-3-3',
						},
					],
				],
				world: [['eins', 'zwei', 'drei']],
			});
		});
	});

	describe('array merging', function () {
		let mappings = null;

		beforeEach(function () {
			mappings = new Mapping([
				{
					from: 'foo[][]',
					to: 'target[][].foo',
				},
				{
					from: 'bar[][]',
					to: 'target[][].bar',
				},
			]);
		});

		it('should write correctly', function () {
			const res = mappings.transform({
				foo: [
					['foo-1-1', 'foo-1-2', 'foo-1-3'],
					['foo-2-1', 'foo-2-2'],
				],
				bar: [
					['bar-1-1', 'bar-1-2'],
					['bar-2-1', 'bar-2-2', 'bar-2-3'],
					['bar-3-1'],
				],
			});

			expect(res).to.deep.equal({
				target: [
					[
						{
							foo: 'foo-1-1',
							bar: 'bar-1-1',
						},
						{
							foo: 'foo-1-2',
							bar: 'bar-1-2',
						},
						{
							foo: 'foo-1-3',
						},
					],
					[
						{
							foo: 'foo-2-1',
							bar: 'bar-2-1',
						},
						{
							foo: 'foo-2-2',
							bar: 'bar-2-2',
						},
						{
							bar: 'bar-2-3',
						},
					],
					[
						{
							bar: 'bar-3-1',
						},
					],
				],
			});
		});
	});
});
