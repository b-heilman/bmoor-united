import {expect} from 'chai';

import {Graph} from '../graph';
import {GraphLoader} from './loader';

describe('@bmoor/graph::loader', function () {
	let graph: Graph = null;
	let loader: GraphLoader = null;

	beforeEach(function () {
		graph = new Graph();
		loader = new GraphLoader({});

		loader.addNodeGenerator({
			type: 'team',
			ref: function (datum): string {
				return <string>datum.t;
			},
			edges: {
				opponent: function (row) {
					return [<string>(row.t == row.home ? row.away : row.home)];
				},
			},
		});

		loader.addNodeGenerator({
			type: 'position',
			ref: function (row): string {
				return row.t + ':' + row.p;
			},
			parentRef: function (datum, parent: {ref: string}): string {
				return parent.ref;
			},
		});

		loader.addNodeGenerator({
			type: 'player',
			ref: function (row): string {
				return <string>row.name;
			},
			parentRef: function (row): string {
				return row.t + ':' + row.p;
			},
			metadata: {
				position: function (row) {
					return <string>row.p;
				},
			},
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
			loader.loadJSON(graph, [
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
					home: 'eagles',
					away: 'chefs',
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
					home: 'eagles',
					away: 'chefs',
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
					home: 'eagles',
					away: 'chefs',
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
					home: 'eagles',
					away: 'chefs',
				},
			]);

			expect(graph.toJSON()).to.deep.equal({
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'eagles',
						type: 'team',
						edges: {
							opponent: ['chefs'],
						},
					},
					{
						ref: 'chefs',
						type: 'team',
						edges: {
							opponent: ['eagles'],
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'def',
						},
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
						metadata: {
							position: 'def',
						},
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
			});
		});
	});

	describe('::fromArray', function () {
		it('should properly load a document to a graph structure', function () {
			loader.loadArray(graph, [
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
					'home',
					'away',
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
					'eagles',
					'chefs',
				],
				[
					'chefs',
					'qb',
					'Ma-Homies',
					'eag-v-chef',
					'1',
					'1/1',
					1,
					6,
					3,
					'eagles',
					'chefs',
				],
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
					'eagles',
					'chefs',
				],
				[
					'chefs',
					'def',
					'Bad-Defense',
					'eag-v-chef',
					'1',
					'1/1',
					1,
					6,
					3,
					'eagles',
					'chefs',
				],
			]);

			expect(graph.toJSON()).to.deep.equal({
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'eagles',
						type: 'team',
						edges: {
							opponent: ['chefs'],
						},
					},
					{
						ref: 'chefs',
						type: 'team',
						edges: {
							opponent: ['eagles'],
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'def',
						},
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
						metadata: {
							position: 'def',
						},
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
			});
		});

		it('should work with multiple intervals', function () {
			loader.loadArray(graph, [
				[
					't',
					'p',
					'name',
					'game',
					'week',
					'passing',
					'attempts',
					'home',
					'away',
				],
				[
					'team-1',
					'qb',
					'p-1-1',
					'game-1',
					1,
					100,
					112,
					'team-1',
					'team-2',
				],
				[
					'team-1',
					'wr',
					'p-1-2',
					'game-1',
					1,
					101,
					101,
					'team-1',
					'team-2',
				],
				[
					'team-2',
					'qb',
					'p-2-1',
					'game-1',
					1,
					102,
					103,
					'team-1',
					'team-2',
				],
				[
					'team-2',
					'wr',
					'p-2-2',
					'game-1',
					1,
					103,
					111,
					'team-1',
					'team-2',
				],
				[
					'team-3',
					'qb',
					'p-3-1',
					'game-2',
					1,
					104,
					100,
					'team-3',
					'team-4',
				],
				[
					'team-3',
					'wr',
					'p-3-2',
					'game-2',
					1,
					105,
					102,
					'team-3',
					'team-4',
				],
				[
					'team-4',
					'qb',
					'p-4-1',
					'game-2',
					1,
					106,
					115,
					'team-3',
					'team-4',
				],
				[
					'team-4',
					'wr',
					'p-4-2',
					'game-2',
					1,
					107,
					113,
					'team-3',
					'team-4',
				],
			]);

			expect(graph.toJSON()).to.deep.equal({
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'team-1',
						type: 'team',
						edges: {
							opponent: ['team-2'],
						},
					},
					{
						ref: 'team-2',
						type: 'team',
						edges: {
							opponent: ['team-1'],
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'wr',
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'wr',
						},
					},
					{
						ref: 'team-3',
						type: 'team',
						edges: {
							opponent: ['team-4'],
						},
					},
					{
						ref: 'team-4',
						type: 'team',
						edges: {
							opponent: ['team-3'],
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'wr',
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'wr',
						},
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
			});
		});

		it('should work with multiple loaders', function () {
			const loader2 = new GraphLoader({});

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

			loader2.loadJSON(graph, [
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

			loader.loadJSON(graph, [
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
					home: 'eagles',
					away: 'chefs',
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
					home: 'eagles',
					away: 'chefs',
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
					home: 'eagles',
					away: 'chefs',
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
					home: 'eagles',
					away: 'chefs',
				},
			]);

			expect(graph.toJSON()).to.deep.equal({
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'eagles',
						type: 'team',
						edges: {
							opponent: ['chefs'],
						},
					},
					{
						ref: 'chefs',
						type: 'team',
						edges: {
							opponent: ['eagles'],
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'qb',
						},
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
						metadata: {
							position: 'def',
						},
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
						metadata: {
							position: 'def',
						},
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
			});
		});
	});
});
