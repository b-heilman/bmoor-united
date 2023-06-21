import {expect} from 'chai';

import {IntervalGraph, load} from './graph';
import {IntervalGraphSelectorMode} from './graph.interface';

describe('@bmoor/interval::graph', function () {
	const schema = {
		intervals: [
			{
				ref: 'd-1',
				label: 'eins',
				order: 0,
			},
			{
				ref: 'd-2',
				label: 'zwei',
				order: 1,
			},
			{
				ref: 'd-3',
				label: 'drei',
				order: 2,
			},
		],
		graphs: {
			'd-1': {
				nodes: [
					{
						ref: 'team-a',
						type: 'team',
						tags: [],
						parentRef: undefined,
						weights: {
							'foo-bar': 1,
						},
					},
					{
						ref: 'pos-1',
						type: 'position',
						tags: ['qb'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-1',
						type: 'player',
						tags: ['qb'],
						parentRef: 'pos-1',
						weights: {},
					},
					{
						ref: 'pos-2',
						type: 'position',
						tags: ['wr'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-2',
						type: 'player',
						tags: [],
						parentRef: 'pos-2',
						weights: {},
					},
					{
						ref: 'team-b',
						type: 'team',
						tags: [],
						parentRef: undefined,
						weights: {},
					},
					{
						ref: 'pos-3',
						type: 'position',
						tags: ['qb'],
						parentRef: 'team-b',
						weights: {},
					},
					{
						ref: 'player-3',
						type: 'player',
						tags: ['qb'],
						parentRef: 'pos-3',
						weights: {},
					},
					{
						ref: 'pos-4',
						type: 'position',
						tags: ['wr'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-4',
						type: 'player',
						tags: [],
						parentRef: 'pos-4',
						weights: {},
					},
				],
				edges: [
					{
						ref: 'game',
						weights: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'team-a',
								weights: {
									score: 21,
								},
							},
							{
								nodeRef: 'team-b',
								weights: {
									score: 31,
								},
							},
							{
								nodeRef: 'player-1',
								weights: {
									passing: 110,
									rushing: 110,
								},
							},
							{
								nodeRef: 'player-2',
								weights: {
									receiving: 210,
								},
							},
							{
								nodeRef: 'player-3',
								weights: {
									passing: 111,
									rushing: 111,
								},
							},
							{
								nodeRef: 'player-4',
								weights: {
									receiving: 212,
								},
							},
						],
					},
				],
			},
			'd-2': {
				nodes: [
					{
						ref: 'team-a',
						type: 'team',
						tags: [],
						parentRef: undefined,
						weights: {
							'foo-bar': 2,
						},
					},
					{
						ref: 'pos-1',
						type: 'position',
						tags: ['qb'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-1',
						type: 'player',
						tags: ['qb'],
						parentRef: 'pos-1',
						weights: {},
					},
					{
						ref: 'pos-2',
						type: 'position',
						tags: ['wr'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-2',
						type: 'player',
						tags: [],
						parentRef: 'pos-2',
						weights: {},
					},
					{
						ref: 'team-b',
						type: 'team',
						tags: [],
						parentRef: undefined,
						weights: {},
					},
					{
						ref: 'pos-3',
						type: 'position',
						tags: ['qb'],
						parentRef: 'team-b',
						weights: {},
					},
					{
						ref: 'player-3',
						type: 'player',
						tags: ['qb'],
						parentRef: 'pos-3',
						weights: {},
					},
					{
						ref: 'pos-4',
						type: 'position',
						tags: ['wr'],
						parentRef: 'team-b',
						weights: {},
					},
					{
						ref: 'player-4',
						type: 'player',
						tags: [],
						parentRef: 'pos-4',
						weights: {},
					},
				],
				edges: [
					{
						ref: 'game',
						weights: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'team-a',
								weights: {
									score: 22,
								},
							},
							{
								nodeRef: 'team-b',
								weights: {
									score: 12,
								},
							},
							{
								nodeRef: 'player-1',
								weights: {
									passing: 120,
									rushing: 120,
								},
							},
							{
								nodeRef: 'player-2',
								weights: {
									passing: 220,
								},
							},
							{
								nodeRef: 'player-3',
								weights: {
									passing: 121,
									rushing: 121,
								},
							},
							{
								nodeRef: 'player-4',
								weights: {
									passing: 222,
								},
							},
						],
					},
				],
			},
			'd-3': {
				nodes: [
					{
						ref: 'team-a',
						type: 'team',
						tags: [],
						parentRef: undefined,
						weights: {
							'foo-bar': 3,
						},
					},
					{
						ref: 'pos-1',
						type: 'position',
						tags: ['qb'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-1',
						type: 'player',
						tags: ['qb'],
						parentRef: 'pos-1',
						weights: {},
					},
					{
						ref: 'pos-2',
						type: 'position',
						tags: ['wr'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-2',
						type: 'player',
						tags: [],
						parentRef: 'pos-2',
						weights: {},
					},
					{
						ref: 'team-b',
						type: 'team',
						tags: [],
						parentRef: undefined,
						weights: {},
					},
					{
						ref: 'pos-3',
						type: 'position',
						tags: ['qb'],
						parentRef: 'team-b',
						weights: {},
					},
					{
						ref: 'player-3',
						type: 'player',
						tags: ['qb'],
						parentRef: 'pos-3',
						weights: {},
					},
					{
						ref: 'pos-4',
						type: 'position',
						tags: ['wr'],
						parentRef: 'team-a',
						weights: {},
					},
					{
						ref: 'player-4',
						type: 'player',
						tags: [],
						parentRef: 'pos-4',
						weights: {},
					},
				],
				edges: [
					{
						ref: 'game',
						weights: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'team-a',
								weights: {
									score: 23,
								},
							},
							{
								nodeRef: 'team-b',
								weights: {
									score: 33,
								},
							},
							{
								nodeRef: 'player-1',
								weights: {
									passing: 130,
									rushing: 130,
								},
							},
							{
								nodeRef: 'player-2',
								weights: {
									passing: 230,
								},
							},
							{
								nodeRef: 'player-3',
								weights: {
									passing: 131,
									rushing: 131,
								},
							},
							{
								nodeRef: 'player-4',
								weights: {
									passing: 232,
								},
							},
						],
					},
				],
			},
		},
	};

	let iGraph: IntervalGraph = null;

	beforeEach(function () {
		iGraph = load(schema);
	});

	it('should work with toJSON', function () {
		expect(iGraph.toJSON()).to.deep.equal(schema);
	});

	describe('::select', function () {
		it('should work on the node', async function () {
			const res = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.node,
				reference: 'team-a',
			});

			expect(
				await Promise.all(res.map((v) => v.getValue('foo-bar'))),
			).to.deep.equal([2]);
		});

		it('should work on the edges', async function () {
			const res = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.edge,
				reference: 'player-1',
			});

			expect(
				await Promise.all(res.map((v) => v.getValue('passing'))),
			).to.deep.equal([120]);
		});
	});

	describe('::subSelect', function () {
		it('should work on the node', async function () {
			const datum = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.node,
				reference: 'team-a',
			})[0];

			const res = iGraph.subSelect(datum, 'd-2', {
				mode: IntervalGraphSelectorMode.edge,
				type: 'player',
			});

			expect(
				await Promise.all(res.map((v) => v.getValue('passing'))),
			).to.deep.equal([120, 220]);
		});
	});

	describe('::intervalSelect', function () {
		it('should work on the node', async function () {
			const datum = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.edge,
				reference: 'player-1',
			})[0];

			const res = iGraph.intervalSelect(datum, 'd-1');

			expect(await res.getValue('passing')).to.deep.equal(110);
		});
	});

	describe('::rangeSelect', function () {
		it('should work on the node', async function () {
			const datum = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.node,
				reference: 'team-a',
			})[0];

			const res = iGraph.rangeSelect(datum, 'd-2', 2);

			expect(
				await Promise.all(res.map((v) => v.getValue('foo-bar'))),
			).to.deep.equal([1, 2]);
		});

		it('should work on the edges', async function () {
			const datum = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.edge,
				reference: 'player-1',
			})[0];

			const res = iGraph.rangeSelect(datum, 'd-2', 2);

			expect(
				await Promise.all(res.map((v) => v.getValue('passing'))),
			).to.deep.equal([110, 120]);
		});

		it('should work range overflow', async function () {
			const datum = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.edge,
				type: 'player',
				tag: 'qb',
			})[0];

			const res = iGraph.rangeSelect(datum, 'd-2', 3);

			expect(
				await Promise.all(res.map((v) => v.getValue('passing'))),
			).to.deep.equal([110, 120]);
		});

		it('should work with range correct', async function () {
			const datum = iGraph.select('d-2', {
				mode: IntervalGraphSelectorMode.edge,
				type: 'player',
				tag: 'qb',
			})[0];

			const res = iGraph.rangeSelect(datum, 'd-3', 3);

			expect(
				await Promise.all(res.map((v) => v.getValue('passing'))),
			).to.deep.equal([110, 120, 130]);
		});
	});
});
