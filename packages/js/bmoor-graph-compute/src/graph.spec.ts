import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {GraphCompute, load} from './graph';
import {NodeValueSelector} from './graph.interface';
import {IntervalInterface} from './interval.interface';

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
		sections: {
			'd-1': {
				root: {
					ref: '__root__',
					type: 'root',
				},
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
					{
						ref: 'player-5',
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
				root: {
					ref: '__root__',
					type: 'root',
				},
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
				root: {
					ref: '__root__',
					type: 'root',
				},
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
					{
						ref: 'player-5',
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

	let ctx: Context;
	let iGraph: GraphCompute = null;
	let i1: IntervalInterface = null;
	let i2: IntervalInterface = null;
	let i3: IntervalInterface = null;

	beforeEach(function () {
		ctx = new Context({});

		iGraph = load(ctx, schema);
		i1 = iGraph.getInterval('d-1');
		i2 = iGraph.getInterval('d-2');
		i3 = iGraph.getInterval('d-3');
	});

	it('should work with toJSON', function () {
		expect(iGraph.toJSON()).to.deep.equal(schema);
	});

	describe('::select', function () {
		it('should work on the node', async function () {
			const datum = iGraph.getDatum('team-a', i2);

			expect(
				await datum.getValue(
					'foo-bar', 
					() => null, 
					{mode:NodeValueSelector.node}
				),
			).to.deep.equal(2);
		});

		it('should work on the events', async function () {
			const datum = iGraph.getDatum('player-1', i2);

			expect(
				await datum.getValue(
					'passing', 
					() => null, 
					{mode:NodeValueSelector.event}
				)
			).to.deep.equal(120);
		});
	});

	describe('::subSelect', function () {
		it('should work on the node', async function () {
			const datum = iGraph.getDatum('team-a', i2);

			const res = datum.select({
				type: 'player',
			});

			expect(
				await Promise.all(
					res.map((datum) => {
						return datum.getValue('passing', () => null, {mode:NodeValueSelector.event});
					}),
				),
			).to.deep.equal([120, 220]);
		});
	});

	/*
	describe('::intervalSelect', function () {
		it('should work on the node', async function () {
			const datum = iGraph.select(i2, {
				reference: 'player-1',
			})[0];

			const res = iGraph.intervalSelect(datum, i1);

			expect(
				await res.getValue('passing', () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(110);
		});
	});
	*/
	describe('::rangeSelect', function () {
		it('should work on the node', async function () {
			const datum = iGraph.getDatum('team-a', i2);

			const res = iGraph.range(datum, 2);

			expect(await res[0].getValue('foo-bar', () => null, {})).to.deep.equal(1);

			expect(await res[1].getValue('foo-bar', () => null, {})).to.deep.equal(2);
		});

		it('should work on the events', async function () {
			const datum = iGraph.getDatum('player-1', i2);

			const res = iGraph.range(datum, 2);

			expect(
				await res[0].getValue('passing', () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(110);

			expect(
				await res[1].getValue('passing', () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(120);
		});

		it('should work range overflow', async function () {
			const datum = iGraph.select(null, {
				interval: i2,
				type: 'player',
				metadata: {
					position: 'qb',
				},
			})[0];

			const res = iGraph.range(datum, 3);

			expect(
				await res[0].getValue('passing', () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(110);

			expect(
				await res[1].getValue('passing', () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(120);
		});

		it('should work with range correct', async function () {
			const datum = iGraph.select(null, {
				interval: i3,
				type: 'player',
				metadata: {
					position: 'qb',
				},
			})[0];

			const res = iGraph.range(datum, 3);

			expect(
				await res[0].getValue('passing',  () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(110);

			expect(
				await res[1].getValue('passing',  () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(120);

			expect(
				await res[2].getValue('passing',  () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(130);
		});

		it('should work on the node with strict false', async function () {
			const datum = iGraph.getDatum('player-1', i2);

			const res = iGraph.range(datum, 3, false);

			expect(
				await res[0].getValue('passing',  () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(120);

			expect(
				await res[1].getValue('passing',  () => null, {mode:NodeValueSelector.event}),
			).to.deep.equal(130);
		});

		it('should fail if strict and missing data', async function () {
			let failed = false;
			const datum = iGraph.getDatum('player-5', i1);

			try {
				iGraph.range(datum, 3, true);
			} catch (ex) {
				failed = true;
			}

			expect(failed).to.equal(true);
		});

		it('should be ok if not strict and missing data', async function () {
			let failed = false;
			const datum = iGraph.getDatum('player-5', i1);

			try {
				iGraph.range(datum, 3, false);
			} catch (ex) {
				failed = true;
			}

			expect(failed).to.equal(false);
		});
	});
});
