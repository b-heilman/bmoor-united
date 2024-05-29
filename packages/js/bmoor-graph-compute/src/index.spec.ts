import {expect} from 'chai';

import {
	mean, 
	sum, 
	DatumRanker,
	DatumOffset,
	DatumRange,
	DatumAcross,
	DatumCompute
} from '@bmoor/compute';
import {Context} from '@bmoor/context';
import {GraphDatum} from '@bmoor/graph';

import {
	GraphExecutor,
	GraphCompute,
	GraphComputeInterface,
	GraphComputeLoader,
	GraphComputeSelector,
	Interval,
	IntervalInterface,
	NodeValueSelector
} from './index';
import { GraphComputeDatum } from './datum';
import { GraphComputeDatumInterface } from './datum.interface';

class Offset<RequirementT> extends DatumOffset<
	RequirementT,
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphComputeInterface<
		GraphComputeDatumInterface<GraphComputeSelector>,
		GraphComputeSelector
	>
> {}

class Range<ResponseT, RequirementT> extends DatumRange<
	ResponseT,
	RequirementT,
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphComputeInterface<
		GraphComputeDatumInterface<GraphComputeSelector>,
		GraphComputeSelector
	>
> {}

class Compute<ReponseT, RequirementT> extends DatumCompute<
	ReponseT,
	RequirementT,
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphComputeInterface<
		GraphComputeDatumInterface<GraphComputeSelector>,
		GraphComputeSelector
	>
> {}

class Across<ReponseT, RequirementT> extends DatumAcross<
	ReponseT,
	RequirementT,
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphComputeInterface<
		GraphComputeDatumInterface<GraphComputeSelector>,
		GraphComputeSelector
	>
> {}

class Ranker<RequirementT> extends DatumRanker<
	RequirementT,
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector,
	GraphComputeInterface<
		GraphComputeDatumInterface<GraphComputeSelector>,
		GraphComputeSelector
	>
> {}



describe('bmoor/graph-compute', function () {
	let ctx: Context = null;

	let i1: IntervalInterface = null;
	let i2: IntervalInterface = null;
	let i3: IntervalInterface = null;
	let graph: GraphCompute = null;
	let loader: GraphComputeLoader = null;
	let executor: GraphExecutor = null;

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
		graph = new GraphCompute();
		loader = new GraphComputeLoader({
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

		const rushAccess = new Offset<{value: number}>(
			'get-foo', 
			{value: 'rush'}, 
			{offset: 0}
		);

		playerRushingAverage5 = new Range<number, {mean: {value: number}}>(
			'player-rushing-avg-5', 
			{
				mean: rushAccess
			},
			{
				range: 5,
				offset: 0,
				reducer: mean
			}
		);

		playerRushingAverage2 = new Range<number, {mean: {value: number}}>(
			'player-rushing-avg-2', 
			{
				mean: rushAccess
			},
			{
				range: 2,
				offset: 0,
				reducer: mean
			}
		);

		playerRushingAverage2Agg = new Across(
			'player-rushing-avg-2agg', 
			{
				mean: playerRushingAverage2
			},
			{
				select: {
					root: true,
					type: 'player',
				},
				offset: 0,
				reducer: mean
			}
		);

		playerRushingAverage2Comp = new Compute(
			'player-rushing-avg-2comp',
			{
				agg: playerRushingAverage2Agg,
				avg: playerRushingAverage2
			},{
				offset: 2,
				reducer: function ({agg, avg}: {agg: number, avg: number}) {
					return agg < avg ? 1 : 0;
				},
			}
		);

		executor = new GraphExecutor(graph);
	});

	it('should compute the historical average for a player', async function () {
		const res = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i3)], 
			playerRushingAverage5,
		);

		expect(res).to.deep.equal([110]);

		const res2 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i2)], 
			playerRushingAverage5
		);

		expect(res2).to.deep.equal([110.5]);

		const res3 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i3)], 
			playerRushingAverage2
		);

		expect(res3).to.deep.equal([109.5]);

		const res4 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i1)], 
			playerRushingAverage2
		);

		expect(res4).to.deep.equal([111]);
	});

	it('should compute a composition value', async function () {
		const res1 = await executor.calculate(
			[executor.env.getDatum('t-1', i1)], 
			playerRushingAverage2Agg
		);

		expect(res1).to.deep.equal([29]);

		const res2 = await executor.calculate(
			[executor.env.getDatum('t-1', i2)], 
			playerRushingAverage2Agg
		);

		expect(res2).to.deep.equal([28.875]);

		/**
		const res3 = await executor.calculate(
			i2, playerRushingAverage2Agg, {
			global: true,
		});

		expect(res3).to.deep.equal([28.1875]);
		**/
	});

	it('should compute values using a global value', async function () {
		const res1 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i1)], 
			playerRushingAverage2Comp
		);

		expect(res1).to.deep.equal([1]);

		const res2 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i2)], 
			playerRushingAverage2Comp
		);

		expect(res2).to.deep.equal([1]);

		const res3 = await executor.calculate(
			[executor.env.getDatum('qb-1-1', i2)], 
			playerRushingAverage2Comp
		);

		expect(res3).to.deep.equal([0]);
	});

	it('should compute values using a diffeent mode', async function () {
		const datum = executor.env.getDatum('rb-1-1', i2);

		await executor.calculate(
			[datum], 
			playerRushingAverage2Comp
		);

		expect(
			await datum.node.getValue(
				'player-rushing-avg-2comp',
				NodeValueSelector.node,
			),
		).to.equal(1);

		expect(
			await datum.node.getValue(
				'player-rushing-avg-2comp',
				NodeValueSelector.event,
			),
		).to.equal(0);

		expect(await datum.node.getValue('rush', NodeValueSelector.node)).to.equal(
			null,
		);

		expect(await datum.node.getValue('rush', NodeValueSelector.event)).to.equal(
			110,
		);
	});

	it('should compute the defensive stats for a team by position group', async function () {
		const rushAccess = new Offset<{value: number}>(
			'get-foo', 
			{value: 'rush'}, 
			{offset: 0}
		);

		const totalRushing = new Across(
			'total-rushing', {
				sum: rushAccess
			},{
				offset: 0,
				select: {
					type: 'player',
				},
				reducer: sum
			}
		);

		const opposingRushing = new Offset(
			'opp-rushing',
			{
				rushing: totalRushing
			},
			{
				select: {
					parent: 'team',
					edge: 'opponent',
				},
			}
		);

		const res1 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i2)], 
			opposingRushing
		);

		const res2 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i2)], 
			opposingRushing
		);

		const res3 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i3)], 
			opposingRushing
		);

		expect(res1).to.deep.equal([125]);
		expect(res2).to.deep.equal([126]);
		expect(res3).to.deep.equal([127]);
	});

	/**
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

		const res1 = await executor.calculate(
			[executor.env.getDatum('rb-1-1', i1)], 
			ranker
		);

		const res2 = await executor.calculate(
			[executor.env.getDatum('wr-1-3', i1)], 
			ranker
		);

		const res3 = await executor.calculate(
			[executor.env.getDatum('wr-1-4', i3)], 
			ranker
		);

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

		const res1 = await executor.calculate(
			[executor.env.getDatum('t-1', i1)], 
			ranker
		);

		const res2 = await executor.calculate(
			[executor.env.getDatum('t-2', i1)], 
			ranker,
		);

		const res3 = await executor.calculate(
			[executor.env.getDatum('t-3', i1)], 
			ranker
		);

		const res4 = await executor.calculate(
			[executor.env.getDatum('t-4', i1)], 
			ranker
		);

		expect(res1).to.deep.equal([1]);
		expect(res2).to.deep.equal([2]);
		expect(res3).to.deep.equal([3]);
		expect(res4).to.deep.equal([4]);
	});
	**/
});
