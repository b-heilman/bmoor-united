import {expect} from 'chai';

import {DimensionalGraph} from '../graph';
import {Interval} from '../interval';
import {DimensionalGraphLoader} from './loader';

describe('@bmoor/graph-compute::loader', function () {
	let graph: DimensionalGraph = null;
	let loader: DimensionalGraphLoader = null;

	beforeEach(function () {
		graph = new DimensionalGraph();
		loader = new DimensionalGraphLoader({
			generateInterval: function (dict) {
				const interval = new Interval(
					<string>dict.week,
					parseInt(<string>dict.week),
					<string>dict.date,
				);

				return interval;
			},
		});

		loader.addNodeGenerator({
			ref: function (datum): string {
				return <string>datum.t;
			},
			type: 'team',
		});

		loader.addNodeGenerator({
			ref: function (row): string {
				return row.t + ':' + row.p;
			},
			parentRef: function (datum): string {
				return <string>datum.t;
			},
			type: 'position',
		});

		loader.addNodeGenerator({
			ref: function (row): string {
				return <string>row.name;
			},
			parentRef: function (row): string {
				return row.t + ':' + row.p;
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
					features: ['passing', 'attempts', 'complete'],
				},
			],
		});
	});

	describe('::load', function () {
		it('should properly load a document to a graph structure', function () {
			loader.loadDimensionalJSON(graph, [
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56,
				},
				{
					t: 'chefs',
					p: 'qb',
					name: 'Ma-Homies',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3,
				},
				{
					t: 'eagles',
					p: 'def',
					name: 'Good-Defense',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56,
				},
				{
					t: 'chefs',
					p: 'def',
					name: 'Bad-Defense',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3,
				},
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-9ers',
					week: '2',
					date: '1/12',
					passing: 120,
					attempts: 40,
					complete: 30,
				},
			]);

			expect(graph.toJSON()).to.deep.equal({
				intervals: [
					{
						ref: '1',
						label: '1/1',
						order: 1,
					},
					{
						ref: '2',
						label: '1/12',
						order: 2,
					},
				],
				graphs: {
					'1': {
						nodes: [
							{
								ref: 'eagles',

								type: 'team',
							},
							{
								ref: 'eagles:qb',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Hurts-so-good',
								type: 'player',
								parentRef: 'eagles:qb',
							},
							{
								ref: 'chefs',
								type: 'team',
							},
							{
								ref: 'chefs:qb',
								type: 'position',
								parentRef: 'chefs',
							},
							{
								ref: 'Ma-Homies',
								type: 'player',
								parentRef: 'chefs:qb',
							},
							{
								ref: 'eagles:def',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Good-Defense',
								type: 'player',
								parentRef: 'eagles:def',
							},
							{
								ref: 'chefs:def',
								type: 'position',
								parentRef: 'chefs',
							},
							{
								ref: 'Bad-Defense',
								type: 'player',
								parentRef: 'chefs:def',
							},
						],
						events: [
							{
								ref: 'eag-v-chef',

								connections: [
									{
										nodeRef: 'Hurts-so-good',
										features: {
											passing: 12,
											attempts: 34,
											complete: 56,
										},
									},
									{
										nodeRef: 'Ma-Homies',
										features: {
											passing: 1,
											attempts: 6,
											complete: 3,
										},
									},
									{
										nodeRef: 'Good-Defense',
										features: {
											passing: 12,
											attempts: 34,
											complete: 56,
										},
									},
									{
										nodeRef: 'Bad-Defense',
										features: {
											passing: 1,
											attempts: 6,
											complete: 3,
										},
									},
								],
							},
						],
					},
					'2': {
						nodes: [
							{
								ref: 'eagles',
								type: 'team',
							},
							{
								ref: 'eagles:qb',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Hurts-so-good',
								type: 'player',
								parentRef: 'eagles:qb',
							},
						],
						events: [
							{
								ref: 'eag-v-9ers',

								connections: [
									{
										nodeRef: 'Hurts-so-good',
										features: {
											passing: 120,
											attempts: 40,
											complete: 30,
										},
									},
								],
							},
						],
					},
				},
			});
		});
	});

	describe('::fromArray', function () {
		it('should properly load a document to a graph structure', function () {
			loader.loadDimensionalArray(graph, [
				[
					't',
					'p',
					'name',
					'game',
					'week',
					'date',
					'passing',
					'attempts',
					'complete',
				],
				[
					'eagles',
					'qb',
					'Hurts-so-good',
					'eag-v-chef',
					'1',
					'1/1',
					12,
					34,
					56,
				],
				['chefs', 'qb', 'Ma-Homies', 'eag-v-chef', '1', '1/1', 1, 6, 3],
				[
					'eagles',
					'def',
					'Good-Defense',
					'eag-v-chef',
					'1',
					'1/1',
					12,
					34,
					56,
				],
				['chefs', 'def', 'Bad-Defense', 'eag-v-chef', '1', '1/1', 1, 6, 3],
				[
					'eagles',
					'qb',
					'Hurts-so-good',
					'eag-v-9ers',
					'2',
					'1/12',
					120,
					40,
					30,
				],
			]);

			expect(graph.toJSON()).to.deep.equal({
				intervals: [
					{
						ref: '1',
						label: '1/1',
						order: 1,
					},
					{
						ref: '2',
						label: '1/12',
						order: 2,
					},
				],
				graphs: {
					'1': {
						nodes: [
							{
								ref: 'eagles',

								type: 'team',
							},
							{
								ref: 'eagles:qb',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Hurts-so-good',
								type: 'player',
								parentRef: 'eagles:qb',
							},
							{
								ref: 'chefs',
								type: 'team',
							},
							{
								ref: 'chefs:qb',
								type: 'position',
								parentRef: 'chefs',
							},
							{
								ref: 'Ma-Homies',
								type: 'player',
								parentRef: 'chefs:qb',
							},
							{
								ref: 'eagles:def',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Good-Defense',
								type: 'player',
								parentRef: 'eagles:def',
							},
							{
								ref: 'chefs:def',
								type: 'position',
								parentRef: 'chefs',
							},
							{
								ref: 'Bad-Defense',
								type: 'player',
								parentRef: 'chefs:def',
							},
						],
						events: [
							{
								ref: 'eag-v-chef',

								connections: [
									{
										nodeRef: 'Hurts-so-good',
										features: {
											passing: 12,
											attempts: 34,
											complete: 56,
										},
									},
									{
										nodeRef: 'Ma-Homies',
										features: {
											passing: 1,
											attempts: 6,
											complete: 3,
										},
									},
									{
										nodeRef: 'Good-Defense',
										features: {
											passing: 12,
											attempts: 34,
											complete: 56,
										},
									},
									{
										nodeRef: 'Bad-Defense',
										features: {
											passing: 1,
											attempts: 6,
											complete: 3,
										},
									},
								],
							},
						],
					},
					'2': {
						nodes: [
							{
								ref: 'eagles',
								type: 'team',
							},
							{
								ref: 'eagles:qb',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Hurts-so-good',
								type: 'player',
								parentRef: 'eagles:qb',
							},
						],
						events: [
							{
								ref: 'eag-v-9ers',

								connections: [
									{
										nodeRef: 'Hurts-so-good',
										features: {
											passing: 120,
											attempts: 40,
											complete: 30,
										},
									},
								],
							},
						],
					},
				},
			});
		});

		it('should work with multiple intervals', function () {
			loader.loadDimensionalArray(graph, [
				['t', 'p', 'name', 'game', 'week', 'passing', 'attempts'],
				['team-1', 'qb', 'p-1-1', 'game-1', 1, 100, 112],
				['team-1', 'wr', 'p-1-2', 'game-1', 1, 101, 101],
				['team-2', 'qb', 'p-2-1', 'game-1', 1, 102, 103],
				['team-2', 'wr', 'p-2-2', 'game-1', 1, 103, 111],
				['team-3', 'qb', 'p-3-1', 'game-2', 1, 104, 100],
				['team-3', 'wr', 'p-3-2', 'game-2', 1, 105, 102],
				['team-4', 'qb', 'p-4-1', 'game-2', 1, 106, 115],
				['team-4', 'wr', 'p-4-2', 'game-2', 1, 107, 113],
				['team-1', 'qb', 'p-1-1', 'game-3', 2, 108, 104],
				['team-1', 'wr', 'p-1-2', 'game-3', 2, 109, 105],
				['team-3', 'qb', 'p-3-1', 'game-3', 2, 110, 110],
				['team-3', 'wr', 'p-3-2', 'game-3', 2, 111, 108],
				['team-4', 'qb', 'p-4-1', 'game-4', 2, 112, 107],
				['team-4', 'wr', 'p-4-2', 'game-4', 2, 113, 114],
				['team-2', 'qb', 'p-2-1', 'game-4', 2, 114, 109],
				['team-2', 'wr', 'p-2-2', 'game-4', 2, 115, 106],
			]);

			expect(graph.toJSON()).to.deep.equal({
				intervals: [
					{
						ref: 1,
						order: 1,
						label: undefined,
					},
					{
						ref: 2,
						order: 2,
						label: undefined,
					},
				],
				graphs: {
					'1': {
						nodes: [
							{
								ref: 'team-1',
								type: 'team',
							},
							{
								ref: 'team-1:qb',
								type: 'position',

								parentRef: 'team-1',
							},
							{
								ref: 'p-1-1',
								type: 'player',

								parentRef: 'team-1:qb',
							},
							{
								ref: 'team-1:wr',
								type: 'position',

								parentRef: 'team-1',
							},
							{
								ref: 'p-1-2',
								type: 'player',

								parentRef: 'team-1:wr',
							},
							{
								ref: 'team-2',
								type: 'team',
							},
							{
								ref: 'team-2:qb',
								type: 'position',

								parentRef: 'team-2',
							},
							{
								ref: 'p-2-1',
								type: 'player',

								parentRef: 'team-2:qb',
							},
							{
								ref: 'team-2:wr',
								type: 'position',

								parentRef: 'team-2',
							},
							{
								ref: 'p-2-2',
								type: 'player',

								parentRef: 'team-2:wr',
							},
							{
								ref: 'team-3',
								type: 'team',
							},
							{
								ref: 'team-3:qb',
								type: 'position',

								parentRef: 'team-3',
							},
							{
								ref: 'p-3-1',
								type: 'player',

								parentRef: 'team-3:qb',
							},
							{
								ref: 'team-3:wr',
								type: 'position',

								parentRef: 'team-3',
							},
							{
								ref: 'p-3-2',
								type: 'player',

								parentRef: 'team-3:wr',
							},
							{
								ref: 'team-4',
								type: 'team',
							},
							{
								ref: 'team-4:qb',
								type: 'position',

								parentRef: 'team-4',
							},
							{
								ref: 'p-4-1',
								type: 'player',

								parentRef: 'team-4:qb',
							},
							{
								ref: 'team-4:wr',
								type: 'position',

								parentRef: 'team-4',
							},
							{
								ref: 'p-4-2',
								type: 'player',

								parentRef: 'team-4:wr',
							},
						],
						events: [
							{
								ref: 'game-1',

								connections: [
									{
										nodeRef: 'p-1-1',
										features: {
											passing: 100,
											attempts: 112,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-1-2',
										features: {
											passing: 101,
											attempts: 101,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-2-1',
										features: {
											passing: 102,
											attempts: 103,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-2-2',
										features: {
											passing: 103,
											attempts: 111,
											complete: undefined,
										},
									},
								],
							},
							{
								ref: 'game-2',

								connections: [
									{
										nodeRef: 'p-3-1',
										features: {
											passing: 104,
											attempts: 100,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-3-2',
										features: {
											passing: 105,
											attempts: 102,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-4-1',
										features: {
											passing: 106,
											attempts: 115,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-4-2',
										features: {
											passing: 107,
											attempts: 113,
											complete: undefined,
										},
									},
								],
							},
						],
					},
					'2': {
						nodes: [
							{
								ref: 'team-1',
								type: 'team',
							},
							{
								ref: 'team-1:qb',
								type: 'position',

								parentRef: 'team-1',
							},
							{
								ref: 'p-1-1',
								type: 'player',

								parentRef: 'team-1:qb',
							},
							{
								ref: 'team-1:wr',
								type: 'position',

								parentRef: 'team-1',
							},
							{
								ref: 'p-1-2',
								type: 'player',

								parentRef: 'team-1:wr',
							},
							{
								ref: 'team-3',
								type: 'team',
							},
							{
								ref: 'team-3:qb',
								type: 'position',

								parentRef: 'team-3',
							},
							{
								ref: 'p-3-1',
								type: 'player',

								parentRef: 'team-3:qb',
							},
							{
								ref: 'team-3:wr',
								type: 'position',

								parentRef: 'team-3',
							},
							{
								ref: 'p-3-2',
								type: 'player',

								parentRef: 'team-3:wr',
							},
							{
								ref: 'team-4',
								type: 'team',
							},
							{
								ref: 'team-4:qb',
								type: 'position',

								parentRef: 'team-4',
							},
							{
								ref: 'p-4-1',
								type: 'player',

								parentRef: 'team-4:qb',
							},
							{
								ref: 'team-4:wr',
								type: 'position',

								parentRef: 'team-4',
							},
							{
								ref: 'p-4-2',
								type: 'player',

								parentRef: 'team-4:wr',
							},
							{
								ref: 'team-2',
								type: 'team',
							},
							{
								ref: 'team-2:qb',
								type: 'position',

								parentRef: 'team-2',
							},
							{
								ref: 'p-2-1',
								type: 'player',

								parentRef: 'team-2:qb',
							},
							{
								ref: 'team-2:wr',
								type: 'position',

								parentRef: 'team-2',
							},
							{
								ref: 'p-2-2',
								type: 'player',

								parentRef: 'team-2:wr',
							},
						],
						events: [
							{
								ref: 'game-3',

								connections: [
									{
										nodeRef: 'p-1-1',
										features: {
											passing: 108,
											attempts: 104,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-1-2',
										features: {
											passing: 109,
											attempts: 105,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-3-1',
										features: {
											passing: 110,
											attempts: 110,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-3-2',
										features: {
											passing: 111,
											attempts: 108,
											complete: undefined,
										},
									},
								],
							},
							{
								ref: 'game-4',

								connections: [
									{
										nodeRef: 'p-4-1',
										features: {
											passing: 112,
											attempts: 107,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-4-2',
										features: {
											passing: 113,
											attempts: 114,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-2-1',
										features: {
											passing: 114,
											attempts: 109,
											complete: undefined,
										},
									},
									{
										nodeRef: 'p-2-2',
										features: {
											passing: 115,
											attempts: 106,
											complete: undefined,
										},
									},
								],
							},
						],
					},
				},
			});
		});

		it('should work with multiple loaders', function () {
			const loader2 = new DimensionalGraphLoader({
				generateInterval: function (dict) {
					const interval = new Interval(
						<string>dict.week,
						parseInt(<string>dict.week),
						<string>dict.date,
					);

					return interval;
				},
			});

			loader2.addNodeGenerator({
				rowSplitter: function (row) {
					return [
						{
							t: row.home,
						},
						{
							t: row.away,
						},
					];
				},
				ref: function (datum): string {
					return <string>datum.t;
				},
				type: 'team',
			});

			// TODO: order matters here, I should make it where it
			//   doesn't because it shouldn't.
			loader2.addEventGenerator({
				ref: function (row): string {
					return <string>row.game;
				},
				features: ['home', 'away'],
				connections: [
					{
						nodeRef: function (row): string {
							return <string>row.home;
						},
						featureValues: {
							diff: function (row) {
								return (
									<number>row['home-score'] - <number>row['away-score']
								);
							},
							'home-field': true,
						},
					},
					{
						nodeRef: function (row): string {
							return <string>row.away;
						},
						featureValues: {
							diff: function (row) {
								return (
									<number>row['away-score'] - <number>row['home-score']
								);
							},
							'home-field': false,
						},
					},
				],
			});

			loader2.loadDimensionalJSON(graph, [
				{
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					home: 'eagles',
					away: 'chefs',
					'home-score': 35,
					'away-score': 38,
					'field-conditions': 'shitty',
				},
			]);

			loader.loadDimensionalJSON(graph, [
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56,
				},
				{
					t: 'chefs',
					p: 'qb',
					name: 'Ma-Homies',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3,
				},
				{
					t: 'eagles',
					p: 'def',
					name: 'Good-Defense',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56,
				},
				{
					t: 'chefs',
					p: 'def',
					name: 'Bad-Defense',
					game: 'eag-v-chef',
					week: '1',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3,
				},
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-9ers',
					week: '2',
					date: '1/12',
					passing: 120,
					attempts: 40,
					complete: 30,
				},
			]);

			expect(graph.toJSON()).to.deep.equal({
				intervals: [
					{
						ref: '1',
						label: '1/1',
						order: 1,
					},
					{
						ref: '2',
						label: '1/12',
						order: 2,
					},
				],
				graphs: {
					'1': {
						nodes: [
							{
								ref: 'eagles',

								type: 'team',
							},
							{
								ref: 'chefs',
								type: 'team',
							},
							{
								ref: 'eagles:qb',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Hurts-so-good',
								type: 'player',
								parentRef: 'eagles:qb',
							},
							{
								ref: 'chefs:qb',
								type: 'position',
								parentRef: 'chefs',
							},
							{
								ref: 'Ma-Homies',
								type: 'player',
								parentRef: 'chefs:qb',
							},
							{
								ref: 'eagles:def',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Good-Defense',
								type: 'player',
								parentRef: 'eagles:def',
							},
							{
								ref: 'chefs:def',
								type: 'position',
								parentRef: 'chefs',
							},
							{
								ref: 'Bad-Defense',
								type: 'player',
								parentRef: 'chefs:def',
							},
						],
						events: [
							{
								ref: 'eag-v-chef',
								features: {
									away: 'chefs',
									home: 'eagles',
								},
								connections: [
									{
										nodeRef: 'eagles',
										features: {
											diff: -3,
											'home-field': true,
										},
									},
									{
										nodeRef: 'chefs',
										features: {
											diff: 3,
											'home-field': false,
										},
									},
									{
										nodeRef: 'Hurts-so-good',
										features: {
											passing: 12,
											attempts: 34,
											complete: 56,
										},
									},
									{
										nodeRef: 'Ma-Homies',
										features: {
											passing: 1,
											attempts: 6,
											complete: 3,
										},
									},
									{
										nodeRef: 'Good-Defense',
										features: {
											passing: 12,
											attempts: 34,
											complete: 56,
										},
									},
									{
										nodeRef: 'Bad-Defense',
										features: {
											passing: 1,
											attempts: 6,
											complete: 3,
										},
									},
								],
							},
						],
					},
					'2': {
						nodes: [
							{
								ref: 'eagles',
								type: 'team',
							},
							{
								ref: 'eagles:qb',
								type: 'position',
								parentRef: 'eagles',
							},
							{
								ref: 'Hurts-so-good',
								type: 'player',
								parentRef: 'eagles:qb',
							},
						],
						events: [
							{
								ref: 'eag-v-9ers',

								connections: [
									{
										nodeRef: 'Hurts-so-good',
										features: {
											passing: 120,
											attempts: 40,
											complete: 30,
										},
									},
								],
							},
						],
					},
				},
			});
		});
	});
});
