import {expect} from 'chai';

import {GraphDatum} from '@bmoor/graph';

import {DimensionalGraph, load} from './graph';
import {NodeValueSelector} from './graph.interface';
import {Interval} from './interval';

describe('@bmoor/graph-compute::graph', function () {
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
						features: {
							'foo-bar': 1,
						},
					},
					{
						ref: 'pos-1',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-1',
						type: 'player',
						metadata: {
							position: 'qb',
						},
						parentRef: 'pos-1',
					},
					{
						ref: 'pos-2',
						type: 'position',
						metadata: {
							which: 'wr',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-2',
						type: 'player',
						parentRef: 'pos-2',
					},
					{
						ref: 'team-b',
						type: 'team',
					},
					{
						ref: 'pos-3',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'team-b',
					},
					{
						ref: 'player-3',
						type: 'player',
						metadata: {
							position: 'qb',
						},
						parentRef: 'pos-3',
					},
					{
						ref: 'pos-4',
						type: 'position',
						metadata: {
							which: 'wr',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-4',
						type: 'player',
						parentRef: 'pos-4',
					},
				],
				events: [
					{
						ref: 'game-1',
						features: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'team-a',
								features: {
									score: 21,
								},
							},
							{
								nodeRef: 'team-b',
								features: {
									score: 31,
								},
							},
							{
								nodeRef: 'player-1',
								features: {
									passing: 110,
									rushing: 110,
								},
							},
							{
								nodeRef: 'player-2',
								features: {
									receiving: 210,
								},
							},
							{
								nodeRef: 'player-3',
								features: {
									passing: 111,
									rushing: 111,
								},
							},
							{
								nodeRef: 'player-4',
								features: {
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
						features: {
							'foo-bar': 2,
						},
					},
					{
						ref: 'pos-1',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-1',
						type: 'player',
						metadata: {
							position: 'qb',
						},
						parentRef: 'pos-1',
					},
					{
						ref: 'pos-2',
						type: 'position',
						metadata: {
							which: 'wr',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-2',
						type: 'player',
						parentRef: 'pos-2',
					},
					{
						ref: 'team-b',
						type: 'team',
					},
					{
						ref: 'pos-3',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'team-b',
					},
					{
						ref: 'player-3',
						type: 'player',
						metadata: {
							position: 'qb',
						},
						parentRef: 'pos-3',
					},
					{
						ref: 'pos-4',
						type: 'position',
						metadata: {
							which: 'wr',
						},
						parentRef: 'team-b',
					},
					{
						ref: 'player-4',
						type: 'player',
						parentRef: 'pos-4',
					},
				],
				events: [
					{
						ref: 'game-2',
						features: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'team-a',
								features: {
									score: 22,
								},
							},
							{
								nodeRef: 'team-b',
								features: {
									score: 12,
								},
							},
							{
								nodeRef: 'player-1',
								features: {
									passing: 120,
									rushing: 120,
								},
							},
							{
								nodeRef: 'player-2',
								features: {
									passing: 220,
								},
							},
							{
								nodeRef: 'player-3',
								features: {
									passing: 121,
									rushing: 121,
								},
							},
							{
								nodeRef: 'player-4',
								features: {
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
						features: {
							'foo-bar': 3,
						},
					},
					{
						ref: 'pos-1',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-1',
						type: 'player',
						metadata: {
							position: 'qb',
						},
						parentRef: 'pos-1',
					},
					{
						ref: 'pos-2',
						type: 'position',
						metadata: {
							position: 'wr',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-2',
						type: 'player',
						parentRef: 'pos-2',
					},
					{
						ref: 'team-b',
						type: 'team',
					},
					{
						ref: 'pos-3',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'team-b',
					},
					{
						ref: 'player-3',
						type: 'player',
						metadata: {
							position: 'qb',
						},
						parentRef: 'pos-3',
					},
					{
						ref: 'pos-4',
						type: 'position',
						metadata: {
							position: 'wr',
						},
						parentRef: 'team-a',
					},
					{
						ref: 'player-4',
						type: 'player',
						parentRef: 'pos-4',
					},
				],
				events: [
					{
						ref: 'game-3',
						features: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'team-a',
								features: {
									score: 23,
								},
							},
							{
								nodeRef: 'team-b',
								features: {
									score: 33,
								},
							},
							{
								nodeRef: 'player-1',
								features: {
									passing: 130,
									rushing: 130,
								},
							},
							{
								nodeRef: 'player-2',
								features: {
									passing: 230,
								},
							},
							{
								nodeRef: 'player-3',
								features: {
									passing: 131,
									rushing: 131,
								},
							},
							{
								nodeRef: 'player-4',
								features: {
									passing: 232,
								},
							},
						],
					},
				],
			},
		},
	};

	let iGraph: DimensionalGraph = null;
	let i1: Interval = null;
	let i2: Interval = null;
	let i3: Interval = null;

	beforeEach(function () {
		iGraph = load(schema);
		i1 = iGraph.getInterval('d-1');
		i2 = iGraph.getInterval('d-2');
		i3 = iGraph.getInterval('d-3');
	});

	it('should work with toJSON', function () {
		expect(iGraph.toJSON()).to.deep.equal(schema);
	});

	describe('::select', function () {
		it('should work on the node', async function () {
			const res = iGraph.select(i2, {
				reference: 'team-a',
			});

			expect(
				await Promise.all(
					res.map((v: GraphDatum) =>
						v.getValue('foo-bar', NodeValueSelector.node),
					),
				),
			).to.deep.equal([2]);
		});

		it('should work on the events', async function () {
			const res = iGraph.select(i2, {
				reference: 'player-1',
			});

			expect(
				await Promise.all(
					res.map((v: GraphDatum) =>
						v.getValue('passing', NodeValueSelector.event),
					),
				),
			).to.deep.equal([120]);
		});
	});

	describe('::subSelect', function () {
		it('should work on the node', async function () {
			const selection = iGraph.select(i2, {
				reference: 'team-a',
			});

			const res = (<GraphDatum>selection[0]).select({
				type: 'player',
			});

			expect(
				await Promise.all(
					res.map((v: GraphDatum) =>
						v.getValue('passing', NodeValueSelector.event),
					),
				),
			).to.deep.equal([120, 220]);
		});
	});

	describe('::intervalSelect', function () {
		it('should work on the node', async function () {
			const datum = <GraphDatum>iGraph.select(i2, {
				reference: 'player-1',
			})[0];

			const res = iGraph.intervalSelect(datum, i1);

			expect(
				await res.getValue('passing', NodeValueSelector.event),
			).to.deep.equal(110);
		});
	});

	describe('::rangeSelect', function () {
		it('should work on the node', async function () {
			const datum = <GraphDatum>iGraph.select(i2, {
				reference: 'team-a',
			})[0];

			const res = iGraph.rangeSelect(datum, i2, 2);

			expect(await res.get(i1).getValue('foo-bar')).to.deep.equal(1);

			expect(await res.get(i2).getValue('foo-bar')).to.deep.equal(2);
		});

		it('should work on the events', async function () {
			const datum = <GraphDatum>iGraph.select(i2, {
				reference: 'player-1',
			})[0];

			const res = iGraph.rangeSelect(datum, i2, 2);

			expect(
				await res.get(i1).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(110);

			expect(
				await res.get(i2).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(120);
		});

		it('should work range overflow', async function () {
			const datum = <GraphDatum>iGraph.select(i2, {
				type: 'player',
				metadata: {
					position: 'qb',
				},
			})[0];

			const res = iGraph.rangeSelect(datum, i2, 3);

			expect(
				await res.get(i1).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(110);

			expect(
				await res.get(i2).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(120);
		});

		it('should work with range correct', async function () {
			const datum = <GraphDatum>iGraph.select(i2, {
				type: 'player',
				metadata: {
					position: 'qb',
				},
			})[0];

			const res = iGraph.rangeSelect(datum, i3, 3);

			expect(
				await res.get(i1).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(110);

			expect(
				await res.get(i2).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(120);

			expect(
				await res.get(i3).getValue('passing', NodeValueSelector.event),
			).to.deep.equal(130);
		});
	});
});
