import {expect} from 'chai';

import {mean, sum} from '@bmoor/compute';
import {Context} from '@bmoor/context';
import {GraphDatum} from '@bmoor/graph';

import {
	DimensionalDatumAccessor as Accessor,
	DimensionalExecutor,
	DimensionalGraph,
	DimensionalGraphLoader,
	Interval,
	NodeValueSelector,
	DimensionalDatumProcessor as Processor,
	DimensionalDatumRanker as Ranker,
} from './index';

describe('bmoor/graph-compute', function () {
	let ctx: Context = null;

	let i1: Interval = null;
	let i2: Interval = null;
	let i3: Interval = null;
	let graph: DimensionalGraph = null;
	let loader: DimensionalGraphLoader = null;
	let executor: DimensionalExecutor = null;

	let playerRushingAverage5 = null;
	let playerRushingAverage2 = null;
	let playerRushingAverage2Agg = null;
	let playerRushingAverage2Comp = null;
	/**
	 * Going to write tests around my primary use case, being able
	 * to do calculations that I will feed to an AI is what I'm proving here.
	 * These tests should be very high level, POC is what I want here, so no
	 * adding tests for low level features.
	 */
	beforeEach(function () {
		ctx = new Context({});
		graph = new DimensionalGraph();
		loader = new DimensionalGraphLoader({
			generateInterval: function (dict) {
				const interval = new Interval(
					<string>dict.week,
					parseInt(<string>dict.week),
					<string>dict.week,
				);

				return interval;
			},
		});

		loader.addNodeGenerator({
			ref: function (datum): string {
				return <string>datum.team;
			},
			type: 'team',
			edges: {
				opponent: function (row) {
					return [<string>(row.team == row.home ? row.away : row.home)];
				},
			},
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

		loader.loadDimensionalArray(ctx, graph, [
			[
				'week',
				'game',
				'team',
				'home',
				'away',
				'position',
				'name',
				'att',
				'comp',
				'pass',
				'rec',
				'rush',
			],
			[
				'1',
				't-1-2',
				't-1',
				't-1',
				't-2',
				'qb',
				'qb-1-1',
				20,
				15,
				211,
				0,
				0,
			],
			[
				'1',
				't-1-2',
				't-1',
				't-1',
				't-2',
				'rb',
				'rb-1-1',
				0,
				0,
				0,
				15,
				111,
			],
			['1', 't-1-2', 't-1', 't-1', 't-2', 'wr', 'wr-1-1', 0, 0, 0, 100, 5],
			['1', 't-1-2', 't-1', 't-1', 't-2', 'wr', 'wr-2-1', 0, 0, 0, 85, 0],
			[
				'1',
				't-1-2',
				't-2',
				't-1',
				't-2',
				'qb',
				'qb-1-2',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'1',
				't-1-2',
				't-2',
				't-1',
				't-2',
				'rb',
				'rb-1-2',
				0,
				0,
				0,
				15,
				100,
			],
			[
				'1',
				't-1-2',
				't-2',
				't-1',
				't-2',
				'wr',
				'wr-1-2',
				0,
				0,
				0,
				100,
				25,
			],
			['1', 't-1-2', 't-2', 't-1', 't-2', 'wr', 'wr-2-2', 0, 0, 0, 85, 0],
			[
				'1',
				't-3-4',
				't-3',
				't-3',
				't-4',
				'qb',
				'qb-1-3',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'1',
				't-3-4',
				't-3',
				't-3',
				't-4',
				'rb',
				'rb-1-3',
				0,
				0,
				0,
				15,
				100,
			],
			['1', 't-3-4', 't-3', 't-3', 't-4', 'wr', 'wr-1-3', 0, 0, 0, 100, 5],
			['1', 't-3-4', 't-3', 't-3', 't-4', 'wr', 'wr-2-3', 0, 0, 0, 85, 0],
			[
				'1',
				't-3-4',
				't-4',
				't-3',
				't-4',
				'qb',
				'qb-1-4',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'1',
				't-3-4',
				't-4',
				't-3',
				't-4',
				'rb',
				'rb-1-4',
				0,
				0,
				0,
				15,
				100,
			],
			['1', 't-3-4', 't-4', 't-3', 't-4', 'wr', 'wr-1-4', 0, 0, 0, 100, 5],
			['1', 't-3-4', 't-4', 't-3', 't-4', 'wr', 'wr-2-4', 0, 0, 0, 85, 0],

			[
				'2',
				't-1-3',
				't-1',
				't-1',
				't-3',
				'qb',
				'qb-1-1',
				20,
				15,
				210,
				0,
				0,
			],
			[
				'2',
				't-1-3',
				't-1',
				't-1',
				't-3',
				'rb',
				'rb-1-1',
				0,
				0,
				0,
				15,
				110,
			],
			['2', 't-1-3', 't-1', 't-1', 't-3', 'wr', 'wr-1-1', 0, 0, 0, 100, 5],
			['2', 't-1-3', 't-1', 't-1', 't-3', 'wr', 'wr-2-1', 0, 0, 0, 85, 0],
			[
				'2',
				't-1-3',
				't-3',
				't-1',
				't-3',
				'qb',
				'qb-1-3',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'2',
				't-1-3',
				't-3',
				't-1',
				't-3',
				'rb',
				'rb-1-3',
				0,
				0,
				0,
				15,
				100,
			],
			[
				'2',
				't-1-3',
				't-3',
				't-1',
				't-3',
				'wr',
				'wr-1-3',
				0,
				0,
				0,
				100,
				26,
			],
			['2', 't-1-3', 't-3', 't-1', 't-3', 'wr', 'wr-2-3', 0, 0, 0, 85, 0],
			[
				'2',
				't-2-4',
				't-2',
				't-2',
				't-4',
				'qb',
				'qb-1-2',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'2',
				't-2-4',
				't-2',
				't-2',
				't-4',
				'rb',
				'rb-1-2',
				0,
				0,
				0,
				15,
				100,
			],
			['2', 't-2-4', 't-2', 't-2', 't-4', 'wr', 'wr-1-2', 0, 0, 0, 100, 5],
			['2', 't-2-4', 't-2', 't-2', 't-4', 'wr', 'wr-2-2', 0, 0, 0, 85, 0],
			[
				'2',
				't-2-4',
				't-4',
				't-2',
				't-4',
				'qb',
				'qb-1-4',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'2',
				't-2-4',
				't-4',
				't-2',
				't-4',
				'rb',
				'rb-1-4',
				0,
				0,
				0,
				15,
				100,
			],
			['2', 't-2-4', 't-4', 't-2', 't-4', 'wr', 'wr-1-4', 0, 0, 0, 100, 5],
			['2', 't-2-4', 't-4', 't-2', 't-4', 'wr', 'wr-2-4', 0, 0, 0, 85, 0],

			[
				'3',
				't-1-4',
				't-1',
				't-1',
				't-4',
				'qb',
				'qb-1-1',
				20,
				15,
				209,
				0,
				0,
			],
			[
				'3',
				't-1-4',
				't-1',
				't-1',
				't-4',
				'rb',
				'rb-1-1',
				0,
				0,
				0,
				15,
				109,
			],
			['3', 't-1-4', 't-1', 't-1', 't-4', 'wr', 'wr-1-1', 0, 0, 0, 100, 5],
			['3', 't-1-4', 't-1', 't-1', 't-4', 'wr', 'wr-2-1', 0, 0, 0, 85, 0],
			[
				'3',
				't-1-4',
				't-4',
				't-1',
				't-4',
				'qb',
				'qb-1-4',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'3',
				't-1-4',
				't-4',
				't-1',
				't-4',
				'rb',
				'rb-1-4',
				0,
				0,
				0,
				15,
				100,
			],
			[
				'3',
				't-1-4',
				't-4',
				't-1',
				't-4',
				'wr',
				'wr-1-4',
				0,
				0,
				0,
				100,
				27,
			],
			['3', 't-1-4', 't-4', 't-1', 't-4', 'wr', 'wr-2-4', 0, 0, 0, 85, 0],
			[
				'3',
				't-3-2',
				't-3',
				't-3',
				't-2',
				'qb',
				'qb-1-3',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'3',
				't-3-2',
				't-3',
				't-3',
				't-2',
				'rb',
				'rb-1-3',
				0,
				0,
				0,
				15,
				100,
			],
			['3', 't-3-2', 't-3', 't-3', 't-2', 'wr', 'wr-1-3', 0, 0, 0, 100, 5],
			['3', 't-3-2', 't-3', 't-3', 't-2', 'wr', 'wr-2-3', 0, 0, 0, 85, 0],
			[
				'3',
				't-3-2',
				't-2',
				't-3',
				't-2',
				'qb',
				'qb-1-2',
				20,
				15,
				200,
				0,
				0,
			],
			[
				'3',
				't-3-2',
				't-2',
				't-3',
				't-2',
				'rb',
				'rb-1-2',
				0,
				0,
				0,
				15,
				100,
			],
			['3', 't-3-2', 't-2', 't-3', 't-2', 'wr', 'wr-1-2', 0, 0, 0, 100, 5],
			['3', 't-3-2', 't-2', 't-3', 't-2', 'wr', 'wr-2-2', 0, 0, 0, 85, 0],
		]);

		i1 = graph.getInterval('1');
		i2 = graph.getInterval('2');
		i3 = graph.getInterval('3');

		playerRushingAverage5 = new Processor('player-rushing-avg-5', mean, [
			{
				input: new Accessor({
					value: 'rush',
				}),
				range: 5,
			},
		]);

		playerRushingAverage2 = new Processor('player-rushing-avg-2', mean, [
			{
				input: new Accessor({
					value: 'rush',
				}),
				range: 2,
			},
		]);

		playerRushingAverage2Agg = new Processor(
			'player-rushing-avg-2agg',
			mean,
			[
				{
					input: playerRushingAverage2,
					select: {
						type: 'player',
					},
				},
			],
		);

		playerRushingAverage2Comp = new Processor(
			'player-rushing-avg-2comp',
			function (globalAverage: number, last2Average: number) {
				return globalAverage < last2Average ? 1 : 0;
			},
			[
				{
					input: playerRushingAverage2Agg,
					select: {
						global: true,
					},
					reduce: true,
				},
				{
					input: playerRushingAverage2,
				},
			],
		);

		executor = new DimensionalExecutor(graph);
	});

	it('should compute the historical average for a player', async function () {
		const res = await executor.calculate(i3, playerRushingAverage5, {
			reference: 'rb-1-1',
		});

		expect(res).to.deep.equal([110]);

		const res2 = await executor.calculate(i2, playerRushingAverage5, {
			reference: 'rb-1-1',
		});

		expect(res2).to.deep.equal([110.5]);

		const res3 = await executor.calculate(i3, playerRushingAverage2, {
			reference: 'rb-1-1',
		});

		expect(res3).to.deep.equal([109.5]);

		const res4 = await executor.calculate(i1, playerRushingAverage2, {
			reference: 'rb-1-1',
		});

		expect(res4).to.deep.equal([111]);
	});

	it('should compute a composition value', async function () {
		const res1 = await executor.calculate(i1, playerRushingAverage2Agg, {
			reference: 't-1',
		});

		expect(res1).to.deep.equal([29]);

		const res2 = await executor.calculate(i2, playerRushingAverage2Agg, {
			reference: 't-1',
		});

		expect(res2).to.deep.equal([28.875]);

		const res3 = await executor.calculate(i2, playerRushingAverage2Agg, {
			global: true,
		});

		expect(res3).to.deep.equal([28.1875]);
	});

	it('should compute values using a global value', async function () {
		const res1 = await executor.calculate(i1, playerRushingAverage2Comp, {
			reference: 'rb-1-1',
		});

		expect(res1).to.deep.equal([1]);

		const res2 = await executor.calculate(i2, playerRushingAverage2Comp, {
			reference: 'rb-1-1',
		});

		expect(res2).to.deep.equal([1]);

		const res3 = await executor.calculate(i2, playerRushingAverage2Comp, {
			reference: 'qb-1-1',
		});

		expect(res3).to.deep.equal([0]);
	});

	it('should compute values using a diffeent mode', async function () {
		await executor.calculate(i2, playerRushingAverage2Comp, {
			reference: 'rb-1-1',
		});

		const res: GraphDatum = <GraphDatum>graph.select(i2, {
			reference: 'rb-1-1',
		})[0];

		expect(
			await res.getValue(
				'player-rushing-avg-2comp',
				NodeValueSelector.node,
			),
		).to.equal(1);

		expect(
			await res.getValue(
				'player-rushing-avg-2comp',
				NodeValueSelector.event,
			),
		).to.equal(0);

		expect(await res.getValue('rush', NodeValueSelector.node)).to.equal(
			null,
		);

		expect(await res.getValue('rush', NodeValueSelector.event)).to.equal(
			110,
		);
	});

	it('should compute the defensive stats for a team by position group', async function () {
		const totalRushing = new Processor('total-rushing', sum, [
			{
				input: new Accessor({
					value: 'rush',
				}),
				select: {
					type: 'player',
				},
			},
		]);

		const opposingRushing = new Processor(
			'opp-rushing',
			(value: number) => value,
			[
				{
					input: totalRushing,
					select: {
						parent: 'team',
						edge: 'opponent',
					},
					reduce: true,
				},
			],
		);

		const res1 = await executor.calculate(i1, opposingRushing, {
			reference: 'rb-1-1',
		});

		const res2 = await executor.calculate(i2, opposingRushing, {
			reference: 'rb-1-1',
		});

		const res3 = await executor.calculate(i3, opposingRushing, {
			reference: 'rb-1-1',
		});

		expect(res1).to.deep.equal([125]);
		expect(res2).to.deep.equal([126]);
		expect(res3).to.deep.equal([127]);
	});

	it('should allow us to rank players by offsensive stats', async function () {
		const ranker = new Ranker(
			'rushing-rank',
			{
				select: {
					parent: 'root',
					type: 'player',
				},
			},
			(data: {value: number}) => data.value,
			[
				{
					input: new Accessor({
						value: 'rush',
					}),
				},
			],
		);

		const res1 = await executor.calculate(i1, ranker, {
			reference: 'rb-1-1',
		});

		const res2 = await executor.calculate(i1, ranker, {
			reference: 'wr-1-3',
		});

		const res3 = await executor.calculate(i3, ranker, {
			reference: 'wr-1-4',
		});

		expect(res1).to.deep.equal([1]);
		expect(res2).to.deep.equal([7]);
		expect(res3).to.deep.equal([5]);
	});

	it('should allow us to rank teams by defensive stats', async function () {
		const totalRushing = new Processor('total-rushing', sum, [
			{
				input: new Accessor({
					value: 'rush',
				}),
				select: {
					type: 'player',
				},
			},
		]);

		const opposingRushing = new Processor(
			'allowed-rushing',
			(value: number) => value,
			[
				{
					input: totalRushing,
					select: {
						parent: 'team',
						edge: 'opponent',
					},
					reduce: true,
				},
			],
		);

		const opposingRushAcross = new Processor('opposing-rushing-5', mean, [
			{
				input: opposingRushing,
				range: 5,
			},
		]);

		const ranker = new Ranker(
			'rushing-rank',
			{
				select: {
					parent: 'root',
					type: 'team',
				},
			},
			(value: number) => value,
			[
				{
					input: opposingRushAcross,
				},
			],
		);

		const res1 = await executor.calculate(i1, ranker, {
			reference: 't-1',
		});

		const res2 = await executor.calculate(i1, ranker, {
			reference: 't-2',
		});

		const res3 = await executor.calculate(i1, ranker, {
			reference: 't-3',
		});

		const res4 = await executor.calculate(i1, ranker, {
			reference: 't-4',
		});

		expect(res1).to.deep.equal([1]);
		expect(res2).to.deep.equal([2]);
		expect(res3).to.deep.equal([3]);
		expect(res4).to.deep.equal([4]);
	});
});
