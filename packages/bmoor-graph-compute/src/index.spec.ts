import {expect} from 'chai';

import {ActionRange, mean} from '@bmoor/compute';

import {
	DimensionalExecutor,
	DimensionalGraph,
	DimensionalGraphLoader,
	DimensionalRegistry,
	Interval,
	NodeValueSelector,
} from './index';

describe('bmoor/graph-compute', function () {
	let i1: Interval = null;
	let i2: Interval = null;
	let i3: Interval = null;
	let graph: DimensionalGraph = null;
	let loader: DimensionalGraphLoader = null;
	let registry: DimensionalRegistry = null;
	let executor: DimensionalExecutor = null;

	/**
	 * Going to write tests around my primary use case, being able
	 * to do calculations that I will feed to an AI is what I'm proving here.
	 * These tests should be very high level, POC is what I want here, so no
	 * adding tests for low level features.
	 */
	beforeEach(function () {
		graph = new DimensionalGraph();
		loader = new DimensionalGraphLoader({
			// TODO: I don't love this...
			readIntervalReference: function (dict) {
				return <string>dict.week;
			},
			generateInterval: function (ref, dict) {
				const interval = new Interval(
					ref,
					<string>dict.week,
					parseInt(<string>dict.week),
				);

				return interval;
			},
		});

		loader.addNodeGenerator({
			ref: function (datum): string {
				return <string>datum.team;
			},
			type: 'team',
		});

		loader.addNodeGenerator({
			ref: function (row): string {
				return row.team + ':off';
			},
			parentRef: function (datum): string {
				return <string>datum.team;
			},
			type: 'off',
		});

		loader.addNodeGenerator({
			ref: function (row): string {
				return row.team + ':def';
			},
			parentRef: function (datum): string {
				return <string>datum.team;
			},
			type: 'def',
		});

		loader.addNodeGenerator({
			ref: function (row): string {
				return row.team + ':' + row.position;
			},
			parentRef: function (datum): string {
				return <string>datum.team + ':off';
			},
			type: 'position-group',
		});

		loader.addNodeGenerator({
			ref: function (row): string {
				return <string>row.name;
			},
			parentRef: function (row): string {
				return row.team + ':' + row.position;
			},
			type: 'player',
		});

		loader.addEventGenerator({
			ref: function (row): string {
				return <string>row.game;
			},
			connections: [
				{
					nodeRef: function (row): string {
						return <string>row.name;
					},
					features: ['att', 'comp', 'pass', 'rec', 'rush'],
				},
			],
		});

		loader.loadDimensionalArray(graph, [
			[
				'week',
				'game',
				'team',
				'position',
				'name',
				'att',
				'comp',
				'pass',
				'rec',
				'rush',
			],
			['1', 't-1-2', 't-1', 'qb', 'qb-1-1', 20, 15, 211, 0, 0],
			['1', 't-1-2', 't-1', 'rb', 'rb-1-1', 0, 0, 0, 15, 111],
			['1', 't-1-2', 't-1', 'wr', 'wr-1-1', 0, 0, 0, 100, 5],
			['1', 't-1-2', 't-1', 'wr', 'wr-2-1', 0, 0, 0, 85, 0],
			['1', 't-1-2', 't-2', 'qb', 'qb-1-2', 20, 15, 200, 0, 0],
			['1', 't-1-2', 't-2', 'rb', 'rb-1-2', 0, 0, 0, 15, 100],
			['1', 't-1-2', 't-2', 'wr', 'wr-1-2', 0, 0, 0, 100, 5],
			['1', 't-1-2', 't-2', 'wr', 'wr-2-2', 0, 0, 0, 85, 0],
			['1', 't-3-4', 't-3', 'qb', 'qb-1-3', 20, 15, 200, 0, 0],
			['1', 't-3-4', 't-3', 'rb', 'rb-1-3', 0, 0, 0, 15, 100],
			['1', 't-3-4', 't-3', 'wr', 'wr-1-3', 0, 0, 0, 100, 5],
			['1', 't-3-4', 't-3', 'wr', 'wr-2-3', 0, 0, 0, 85, 0],
			['1', 't-3-4', 't-4', 'qb', 'qb-1-4', 20, 15, 200, 0, 0],
			['1', 't-3-4', 't-4', 'rb', 'rb-1-4', 0, 0, 0, 15, 100],
			['1', 't-3-4', 't-4', 'wr', 'wr-1-4', 0, 0, 0, 100, 5],
			['1', 't-3-4', 't-4', 'wr', 'wr-2-4', 0, 0, 0, 85, 0],

			['2', 't-1-3', 't-1', 'qb', 'qb-1-1', 20, 15, 210, 0, 0],
			['2', 't-1-3', 't-1', 'rb', 'rb-1-1', 0, 0, 0, 15, 110],
			['2', 't-1-3', 't-1', 'wr', 'wr-1-1', 0, 0, 0, 100, 5],
			['2', 't-1-3', 't-1', 'wr', 'wr-2-1', 0, 0, 0, 85, 0],
			['2', 't-1-3', 't-3', 'qb', 'qb-1-3', 20, 15, 200, 0, 0],
			['2', 't-1-3', 't-3', 'rb', 'rb-1-3', 0, 0, 0, 15, 100],
			['2', 't-1-3', 't-3', 'wr', 'wr-1-3', 0, 0, 0, 100, 5],
			['2', 't-1-3', 't-3', 'wr', 'wr-2-3', 0, 0, 0, 85, 0],
			['2', 't-2-4', 't-2', 'qb', 'qb-1-2', 20, 15, 200, 0, 0],
			['2', 't-2-4', 't-2', 'rb', 'rb-1-2', 0, 0, 0, 15, 100],
			['2', 't-2-4', 't-2', 'wr', 'wr-1-2', 0, 0, 0, 100, 5],
			['2', 't-2-4', 't-2', 'wr', 'wr-2-2', 0, 0, 0, 85, 0],
			['2', 't-2-4', 't-4', 'qb', 'qb-1-4', 20, 15, 200, 0, 0],
			['2', 't-2-4', 't-4', 'rb', 'rb-1-4', 0, 0, 0, 15, 100],
			['2', 't-2-4', 't-4', 'wr', 'wr-1-4', 0, 0, 0, 100, 5],
			['2', 't-2-4', 't-4', 'wr', 'wr-2-4', 0, 0, 0, 85, 0],

			['3', 't-1-4', 't-1', 'qb', 'qb-1-1', 20, 15, 209, 0, 0],
			['3', 't-1-4', 't-1', 'rb', 'rb-1-1', 0, 0, 0, 15, 109],
			['3', 't-1-4', 't-1', 'wr', 'wr-1-1', 0, 0, 0, 100, 5],
			['3', 't-1-4', 't-1', 'wr', 'wr-2-1', 0, 0, 0, 85, 0],
			['3', 't-1-4', 't-4', 'qb', 'qb-1-4', 20, 15, 200, 0, 0],
			['3', 't-1-4', 't-4', 'rb', 'rb-1-4', 0, 0, 0, 15, 100],
			['3', 't-1-4', 't-4', 'wr', 'wr-1-4', 0, 0, 0, 100, 5],
			['3', 't-1-4', 't-4', 'wr', 'wr-2-4', 0, 0, 0, 85, 0],
			['3', 't-3-2', 't-3', 'qb', 'qb-1-3', 20, 15, 200, 0, 0],
			['3', 't-3-2', 't-3', 'rb', 'rb-1-3', 0, 0, 0, 15, 100],
			['3', 't-3-2', 't-3', 'wr', 'wr-1-3', 0, 0, 0, 100, 5],
			['3', 't-3-2', 't-3', 'wr', 'wr-2-3', 0, 0, 0, 85, 0],
			['3', 't-3-2', 't-2', 'qb', 'qb-1-2', 20, 15, 200, 0, 0],
			['3', 't-3-2', 't-2', 'rb', 'rb-1-2', 0, 0, 0, 15, 100],
			['3', 't-3-2', 't-2', 'wr', 'wr-1-2', 0, 0, 0, 100, 5],
			['3', 't-3-2', 't-2', 'wr', 'wr-2-2', 0, 0, 0, 85, 0],
		]);

		i1 = graph.getInterval('1');
		i2 = graph.getInterval('2');
		i3 = graph.getInterval('3');

		// console.log(JSON.stringify(graph, null, 2));

		registry = new DimensionalRegistry();

		const playerRushingAverage5 = new ActionRange(
			'player-rushing-avg-5',
			'rush',
			5,
			mean,
		);

		registry.addAction(playerRushingAverage5);

		const playerRushingAverage2 = new ActionRange(
			'player-rushing-avg-2',
			'rush',
			2,
			mean,
		);

		registry.addAction(playerRushingAverage2);

		executor = new DimensionalExecutor(graph, registry);
	});

	it('should compute the historical average for a player', async function () {
		const res = await executor.calculate(i3, 'player-rushing-avg-5', {
			// TODO: move this to the action
			mode: NodeValueSelector.event,
			reference: 'rb-1-1',
		});

		expect(res).to.deep.equal([110]);

		const res2 = await executor.calculate(i2, 'player-rushing-avg-5', {
			// TODO: move this to the action
			mode: NodeValueSelector.event,
			reference: 'rb-1-1',
		});

		expect(res2).to.deep.equal([110.5]);

		const res3 = await executor.calculate(i3, 'player-rushing-avg-2', {
			// TODO: move this to the action
			mode: NodeValueSelector.event,
			reference: 'rb-1-1',
		});

		expect(res3).to.deep.equal([109.5]);

		const res4 = await executor.calculate(i1, 'player-rushing-avg-2', {
			// TODO: move this to the action
			mode: NodeValueSelector.event,
			reference: 'rb-1-1',
		});

		expect(res4).to.deep.equal([111]);
	});

	xit('should compute values using a global value', function () {
		console.log('TODO');
	});

	xit('should compute values using a edge value', function () {
		console.log('TODO');
	});

	xit('should compute the defensive stats for a team by position group', function () {
		console.log('TODO');
	});

	xit('should allow us to rank teams by defensive stats', function () {
		console.log('TODO');
	});

	xit('should allow us to rank teams by receiving stats', function () {
		console.log('TODO');
	});
});
