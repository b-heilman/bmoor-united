import {expect} from 'chai';

import {mean} from '@bmoor/compute';
import {GraphDatum} from '@bmoor/graph';

import {
	DimensionalDatumAccessor as Accessor,
	DimensionalExecutor,
	DimensionalGraph,
	DimensionalGraphLoader,
	Interval,
	NodeValueSelector,
	DimensionalDatumProcessor as Processor,
} from './index';

describe('bmoor/graph-compute', function () {
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

		playerRushingAverage5 = new Processor('player-rushing-avg-5', mean, [
			{
				accessor: new Accessor({
					value: 'rush',
				}),
				range: 5,
			},
		]);

		playerRushingAverage2 = new Processor('player-rushing-avg-2', mean, [
			{
				accessor: new Accessor({
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
					accessor: new Accessor({
						value: playerRushingAverage2,
					}),
					select: {
						type: 'player',
					},
				},
			],
		);

		// TODO: the accessor shouldn't be needed
		playerRushingAverage2Comp = new Processor(
			'player-rushing-avg-2comp',
			function (
				globalAverage: {value: number},
				last2Average: {value: number},
			) {
				return globalAverage.value < last2Average.value ? 1 : 0;
			},
			[
				{
					accessor: new Accessor({
						value: playerRushingAverage2Agg,
					}),
					select: {
						global: true,
					},
					reduce: true,
				},
				{
					accessor: new Accessor({
						value: playerRushingAverage2,
					}),
				},
			],
		);

		executor = new DimensionalExecutor(graph);
	});

	it('should properly load in the correct shape', async function () {
		expect(graph.toJSON()).to.deep.equal({
			intervals: [
				{
					ref: '1',
					label: '1',
					order: 1,
				},
				{
					ref: '2',
					label: '2',
					order: 2,
				},
				{
					ref: '3',
					label: '3',
					order: 3,
				},
			],
			graphs: {
				'1': {
					nodes: [
						{
							ref: 't-1',
							type: 'team',
						},
						{
							ref: 't-1:off',
							type: 'off',
							parentRef: 't-1',
						},
						{
							ref: 't-1:def',
							type: 'def',
							parentRef: 't-1',
						},
						{
							ref: 't-1:qb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'qb-1-1',
							type: 'player',
							parentRef: 't-1:qb',
						},
						{
							ref: 't-1:rb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'rb-1-1',
							type: 'player',
							parentRef: 't-1:rb',
						},
						{
							ref: 't-1:wr',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'wr-1-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 'wr-2-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 't-2',
							type: 'team',
						},
						{
							ref: 't-2:off',
							type: 'off',
							parentRef: 't-2',
						},
						{
							ref: 't-2:def',
							type: 'def',
							parentRef: 't-2',
						},
						{
							ref: 't-2:qb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'qb-1-2',
							type: 'player',
							parentRef: 't-2:qb',
						},
						{
							ref: 't-2:rb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'rb-1-2',
							type: 'player',
							parentRef: 't-2:rb',
						},
						{
							ref: 't-2:wr',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'wr-1-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 'wr-2-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 't-3',
							type: 'team',
						},
						{
							ref: 't-3:off',
							type: 'off',
							parentRef: 't-3',
						},
						{
							ref: 't-3:def',
							type: 'def',
							parentRef: 't-3',
						},
						{
							ref: 't-3:qb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'qb-1-3',
							type: 'player',
							parentRef: 't-3:qb',
						},
						{
							ref: 't-3:rb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'rb-1-3',
							type: 'player',
							parentRef: 't-3:rb',
						},
						{
							ref: 't-3:wr',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'wr-1-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 'wr-2-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 't-4',
							type: 'team',
						},
						{
							ref: 't-4:off',
							type: 'off',
							parentRef: 't-4',
						},
						{
							ref: 't-4:def',
							type: 'def',
							parentRef: 't-4',
						},
						{
							ref: 't-4:qb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'qb-1-4',
							type: 'player',
							parentRef: 't-4:qb',
						},
						{
							ref: 't-4:rb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'rb-1-4',
							type: 'player',
							parentRef: 't-4:rb',
						},
						{
							ref: 't-4:wr',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'wr-1-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
						{
							ref: 'wr-2-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
					],
					events: [
						{
							ref: 't-1-2',
							connections: [
								{
									nodeRef: 'qb-1-1',
									features: {
										att: 20,
										comp: 15,
										pass: 211,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 111,
									},
								},
								{
									nodeRef: 'wr-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-2',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
						{
							ref: 't-3-4',
							connections: [
								{
									nodeRef: 'qb-1-3',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-4',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
					],
				},
				'2': {
					nodes: [
						{
							ref: 't-1',
							type: 'team',
						},
						{
							ref: 't-1:off',
							type: 'off',
							parentRef: 't-1',
						},
						{
							ref: 't-1:def',
							type: 'def',
							parentRef: 't-1',
						},
						{
							ref: 't-1:qb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'qb-1-1',
							type: 'player',
							parentRef: 't-1:qb',
						},
						{
							ref: 't-1:rb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'rb-1-1',
							type: 'player',
							parentRef: 't-1:rb',
						},
						{
							ref: 't-1:wr',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'wr-1-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 'wr-2-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 't-3',
							type: 'team',
						},
						{
							ref: 't-3:off',
							type: 'off',
							parentRef: 't-3',
						},
						{
							ref: 't-3:def',
							type: 'def',
							parentRef: 't-3',
						},
						{
							ref: 't-3:qb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'qb-1-3',
							type: 'player',
							parentRef: 't-3:qb',
						},
						{
							ref: 't-3:rb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'rb-1-3',
							type: 'player',
							parentRef: 't-3:rb',
						},
						{
							ref: 't-3:wr',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'wr-1-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 'wr-2-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 't-2',
							type: 'team',
						},
						{
							ref: 't-2:off',
							type: 'off',
							parentRef: 't-2',
						},
						{
							ref: 't-2:def',
							type: 'def',
							parentRef: 't-2',
						},
						{
							ref: 't-2:qb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'qb-1-2',
							type: 'player',
							parentRef: 't-2:qb',
						},
						{
							ref: 't-2:rb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'rb-1-2',
							type: 'player',
							parentRef: 't-2:rb',
						},
						{
							ref: 't-2:wr',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'wr-1-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 'wr-2-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 't-4',
							type: 'team',
						},
						{
							ref: 't-4:off',
							type: 'off',
							parentRef: 't-4',
						},
						{
							ref: 't-4:def',
							type: 'def',
							parentRef: 't-4',
						},
						{
							ref: 't-4:qb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'qb-1-4',
							type: 'player',
							parentRef: 't-4:qb',
						},
						{
							ref: 't-4:rb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'rb-1-4',
							type: 'player',
							parentRef: 't-4:rb',
						},
						{
							ref: 't-4:wr',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'wr-1-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
						{
							ref: 'wr-2-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
					],
					events: [
						{
							ref: 't-1-3',
							connections: [
								{
									nodeRef: 'qb-1-1',
									features: {
										att: 20,
										comp: 15,
										pass: 210,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 110,
									},
								},
								{
									nodeRef: 'wr-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-3',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
						{
							ref: 't-2-4',
							connections: [
								{
									nodeRef: 'qb-1-2',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-4',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
					],
				},
				'3': {
					nodes: [
						{
							ref: 't-1',
							type: 'team',
						},
						{
							ref: 't-1:off',
							type: 'off',
							parentRef: 't-1',
						},
						{
							ref: 't-1:def',
							type: 'def',
							parentRef: 't-1',
						},
						{
							ref: 't-1:qb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'qb-1-1',
							type: 'player',
							parentRef: 't-1:qb',
						},
						{
							ref: 't-1:rb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'rb-1-1',
							type: 'player',
							parentRef: 't-1:rb',
						},
						{
							ref: 't-1:wr',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'wr-1-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 'wr-2-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 't-4',
							type: 'team',
						},
						{
							ref: 't-4:off',
							type: 'off',
							parentRef: 't-4',
						},
						{
							ref: 't-4:def',
							type: 'def',
							parentRef: 't-4',
						},
						{
							ref: 't-4:qb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'qb-1-4',
							type: 'player',
							parentRef: 't-4:qb',
						},
						{
							ref: 't-4:rb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'rb-1-4',
							type: 'player',
							parentRef: 't-4:rb',
						},
						{
							ref: 't-4:wr',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'wr-1-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
						{
							ref: 'wr-2-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
						{
							ref: 't-3',
							type: 'team',
						},
						{
							ref: 't-3:off',
							type: 'off',
							parentRef: 't-3',
						},
						{
							ref: 't-3:def',
							type: 'def',
							parentRef: 't-3',
						},
						{
							ref: 't-3:qb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'qb-1-3',
							type: 'player',
							parentRef: 't-3:qb',
						},
						{
							ref: 't-3:rb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'rb-1-3',
							type: 'player',
							parentRef: 't-3:rb',
						},
						{
							ref: 't-3:wr',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'wr-1-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 'wr-2-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 't-2',
							type: 'team',
						},
						{
							ref: 't-2:off',
							type: 'off',
							parentRef: 't-2',
						},
						{
							ref: 't-2:def',
							type: 'def',
							parentRef: 't-2',
						},
						{
							ref: 't-2:qb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'qb-1-2',
							type: 'player',
							parentRef: 't-2:qb',
						},
						{
							ref: 't-2:rb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'rb-1-2',
							type: 'player',
							parentRef: 't-2:rb',
						},
						{
							ref: 't-2:wr',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'wr-1-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 'wr-2-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
					],
					events: [
						{
							ref: 't-1-4',
							connections: [
								{
									nodeRef: 'qb-1-1',
									features: {
										att: 20,
										comp: 15,
										pass: 209,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 109,
									},
								},
								{
									nodeRef: 'wr-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-4',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
						{
							ref: 't-3-2',
							connections: [
								{
									nodeRef: 'qb-1-3',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-2',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
					],
				},
			},
		});
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

		expect(res3).to.deep.equal([26.90625]);
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

	it('should write intermediate values to the right place', async function () {
		await executor.calculate(i3, playerRushingAverage2Comp, {
			reference: 'rb-1-1',
		});

		expect(graph.toJSON()).to.deep.equal({
			intervals: [
				{
					ref: '1',
					label: '1',
					order: 1,
				},
				{
					ref: '2',
					label: '2',
					order: 2,
				},
				{
					ref: '3',
					label: '3',
					order: 3,
				},
			],
			graphs: {
				'1': {
					nodes: [
						{
							ref: 't-1',
							type: 'team',
						},
						{
							ref: 't-1:off',
							type: 'off',
							parentRef: 't-1',
						},
						{
							ref: 't-1:def',
							type: 'def',
							parentRef: 't-1',
						},
						{
							ref: 't-1:qb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'qb-1-1',
							type: 'player',
							parentRef: 't-1:qb',
						},
						{
							ref: 't-1:rb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'rb-1-1',
							type: 'player',
							parentRef: 't-1:rb',
						},
						{
							ref: 't-1:wr',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'wr-1-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 'wr-2-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 't-2',
							type: 'team',
						},
						{
							ref: 't-2:off',
							type: 'off',
							parentRef: 't-2',
						},
						{
							ref: 't-2:def',
							type: 'def',
							parentRef: 't-2',
						},
						{
							ref: 't-2:qb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'qb-1-2',
							type: 'player',
							parentRef: 't-2:qb',
						},
						{
							ref: 't-2:rb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'rb-1-2',
							type: 'player',
							parentRef: 't-2:rb',
						},
						{
							ref: 't-2:wr',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'wr-1-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 'wr-2-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 't-3',
							type: 'team',
						},
						{
							ref: 't-3:off',
							type: 'off',
							parentRef: 't-3',
						},
						{
							ref: 't-3:def',
							type: 'def',
							parentRef: 't-3',
						},
						{
							ref: 't-3:qb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'qb-1-3',
							type: 'player',
							parentRef: 't-3:qb',
						},
						{
							ref: 't-3:rb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'rb-1-3',
							type: 'player',
							parentRef: 't-3:rb',
						},
						{
							ref: 't-3:wr',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'wr-1-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 'wr-2-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 't-4',
							type: 'team',
						},
						{
							ref: 't-4:off',
							type: 'off',
							parentRef: 't-4',
						},
						{
							ref: 't-4:def',
							type: 'def',
							parentRef: 't-4',
						},
						{
							ref: 't-4:qb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'qb-1-4',
							type: 'player',
							parentRef: 't-4:qb',
						},
						{
							ref: 't-4:rb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'rb-1-4',
							type: 'player',
							parentRef: 't-4:rb',
						},
						{
							ref: 't-4:wr',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'wr-1-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
						{
							ref: 'wr-2-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
					],
					events: [
						{
							ref: 't-1-2',
							connections: [
								{
									nodeRef: 'qb-1-1',
									features: {
										att: 20,
										comp: 15,
										pass: 211,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 111,
									},
								},
								{
									nodeRef: 'wr-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-2',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
						{
							ref: 't-3-4',
							connections: [
								{
									nodeRef: 'qb-1-3',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-4',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
					],
				},
				'2': {
					nodes: [
						{
							ref: 't-1',
							type: 'team',
						},
						{
							ref: 't-1:off',
							type: 'off',
							parentRef: 't-1',
						},
						{
							ref: 't-1:def',
							type: 'def',
							parentRef: 't-1',
						},
						{
							ref: 't-1:qb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'qb-1-1',
							type: 'player',
							parentRef: 't-1:qb',
						},
						{
							ref: 't-1:rb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'rb-1-1',
							type: 'player',
							parentRef: 't-1:rb',
						},
						{
							ref: 't-1:wr',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'wr-1-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 'wr-2-1',
							type: 'player',
							parentRef: 't-1:wr',
						},
						{
							ref: 't-3',
							type: 'team',
						},
						{
							ref: 't-3:off',
							type: 'off',
							parentRef: 't-3',
						},
						{
							ref: 't-3:def',
							type: 'def',
							parentRef: 't-3',
						},
						{
							ref: 't-3:qb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'qb-1-3',
							type: 'player',
							parentRef: 't-3:qb',
						},
						{
							ref: 't-3:rb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'rb-1-3',
							type: 'player',
							parentRef: 't-3:rb',
						},
						{
							ref: 't-3:wr',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'wr-1-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 'wr-2-3',
							type: 'player',
							parentRef: 't-3:wr',
						},
						{
							ref: 't-2',
							type: 'team',
						},
						{
							ref: 't-2:off',
							type: 'off',
							parentRef: 't-2',
						},
						{
							ref: 't-2:def',
							type: 'def',
							parentRef: 't-2',
						},
						{
							ref: 't-2:qb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'qb-1-2',
							type: 'player',
							parentRef: 't-2:qb',
						},
						{
							ref: 't-2:rb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'rb-1-2',
							type: 'player',
							parentRef: 't-2:rb',
						},
						{
							ref: 't-2:wr',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'wr-1-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 'wr-2-2',
							type: 'player',
							parentRef: 't-2:wr',
						},
						{
							ref: 't-4',
							type: 'team',
						},
						{
							ref: 't-4:off',
							type: 'off',
							parentRef: 't-4',
						},
						{
							ref: 't-4:def',
							type: 'def',
							parentRef: 't-4',
						},
						{
							ref: 't-4:qb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'qb-1-4',
							type: 'player',
							parentRef: 't-4:qb',
						},
						{
							ref: 't-4:rb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'rb-1-4',
							type: 'player',
							parentRef: 't-4:rb',
						},
						{
							ref: 't-4:wr',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'wr-1-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
						{
							ref: 'wr-2-4',
							type: 'player',
							parentRef: 't-4:wr',
						},
					],
					events: [
						{
							ref: 't-1-3',
							connections: [
								{
									nodeRef: 'qb-1-1',
									features: {
										att: 20,
										comp: 15,
										pass: 210,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 110,
									},
								},
								{
									nodeRef: 'wr-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-3',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
						{
							ref: 't-2-4',
							connections: [
								{
									nodeRef: 'qb-1-2',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-4',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
					],
				},
				'3': {
					nodes: [
						{
							ref: 't-1',
							type: 'team',
						},
						{
							ref: 't-1:off',
							type: 'off',
							parentRef: 't-1',
						},
						{
							ref: 't-1:def',
							type: 'def',
							parentRef: 't-1',
						},
						{
							ref: 't-1:qb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'qb-1-1',
							type: 'player',
							parentRef: 't-1:qb',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-1:rb',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'rb-1-1',
							type: 'player',
							parentRef: 't-1:rb',
							features: {
								'player-rushing-avg-2': 109.5,
								'player-rushing-avg-2comp': 1,
							},
						},
						{
							ref: 't-1:wr',
							type: 'position-group',
							parentRef: 't-1:off',
						},
						{
							ref: 'wr-1-1',
							type: 'player',
							parentRef: 't-1:wr',
							features: {
								'player-rushing-avg-2': 5,
							},
						},
						{
							ref: 'wr-2-1',
							type: 'player',
							parentRef: 't-1:wr',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-4',
							type: 'team',
						},
						{
							ref: 't-4:off',
							type: 'off',
							parentRef: 't-4',
						},
						{
							ref: 't-4:def',
							type: 'def',
							parentRef: 't-4',
						},
						{
							ref: 't-4:qb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'qb-1-4',
							type: 'player',
							parentRef: 't-4:qb',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-4:rb',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'rb-1-4',
							type: 'player',
							parentRef: 't-4:rb',
							features: {
								'player-rushing-avg-2': 100,
							},
						},
						{
							ref: 't-4:wr',
							type: 'position-group',
							parentRef: 't-4:off',
						},
						{
							ref: 'wr-1-4',
							type: 'player',
							parentRef: 't-4:wr',
							features: {
								'player-rushing-avg-2': 5,
							},
						},
						{
							ref: 'wr-2-4',
							type: 'player',
							parentRef: 't-4:wr',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-3',
							type: 'team',
						},
						{
							ref: 't-3:off',
							type: 'off',
							parentRef: 't-3',
						},
						{
							ref: 't-3:def',
							type: 'def',
							parentRef: 't-3',
						},
						{
							ref: 't-3:qb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'qb-1-3',
							type: 'player',
							parentRef: 't-3:qb',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-3:rb',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'rb-1-3',
							type: 'player',
							parentRef: 't-3:rb',
							features: {
								'player-rushing-avg-2': 100,
							},
						},
						{
							ref: 't-3:wr',
							type: 'position-group',
							parentRef: 't-3:off',
						},
						{
							ref: 'wr-1-3',
							type: 'player',
							parentRef: 't-3:wr',
							features: {
								'player-rushing-avg-2': 5,
							},
						},
						{
							ref: 'wr-2-3',
							type: 'player',
							parentRef: 't-3:wr',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-2',
							type: 'team',
						},
						{
							ref: 't-2:off',
							type: 'off',
							parentRef: 't-2',
						},
						{
							ref: 't-2:def',
							type: 'def',
							parentRef: 't-2',
						},
						{
							ref: 't-2:qb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'qb-1-2',
							type: 'player',
							parentRef: 't-2:qb',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
						{
							ref: 't-2:rb',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'rb-1-2',
							type: 'player',
							parentRef: 't-2:rb',
							features: {
								'player-rushing-avg-2': 100,
							},
						},
						{
							ref: 't-2:wr',
							type: 'position-group',
							parentRef: 't-2:off',
						},
						{
							ref: 'wr-1-2',
							type: 'player',
							parentRef: 't-2:wr',
							features: {
								'player-rushing-avg-2': 5,
							},
						},
						{
							ref: 'wr-2-2',
							type: 'player',
							parentRef: 't-2:wr',
							features: {
								'player-rushing-avg-2': 0,
							},
						},
					],
					events: [
						{
							ref: 't-1-4',
							connections: [
								{
									nodeRef: 'qb-1-1',
									features: {
										att: 20,
										comp: 15,
										pass: 209,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 109,
									},
								},
								{
									nodeRef: 'wr-1-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-1',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-4',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-4',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
						{
							ref: 't-3-2',
							connections: [
								{
									nodeRef: 'qb-1-3',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-3',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
								{
									nodeRef: 'qb-1-2',
									features: {
										att: 20,
										comp: 15,
										pass: 200,
										rec: 0,
										rush: 0,
									},
								},
								{
									nodeRef: 'rb-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 15,
										rush: 100,
									},
								},
								{
									nodeRef: 'wr-1-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 100,
										rush: 5,
									},
								},
								{
									nodeRef: 'wr-2-2',
									features: {
										att: 0,
										comp: 0,
										pass: 0,
										rec: 85,
										rush: 0,
									},
								},
							],
						},
					],
				},
			},
		});
	});

	it('should compute values using a edge value', async function () {
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
