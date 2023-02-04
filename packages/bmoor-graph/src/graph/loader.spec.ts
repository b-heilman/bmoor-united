import {expect} from 'chai';
import {Graph} from '../graph';
import {GraphLoader} from './loader';

describe('@bmoor-graph::GraphLoader', function () {
	describe('::load', function () {
		it('should properly load a document to a graph structure', function () {
			const graph = new Graph();
			const loader = new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't'
						}
					},
					{
						type: 'position',
						reference: {
							mount: 'p'
						}
					},
					{
						type: 'player',
						reference: {
							mount: 'name'
						},
						normalizer: (row) => {
							return {
								passing: parseInt(<string>row.passing),
								attempts: parseInt(<string>row.attempts),
								complete: parseInt(<string>row.complete)
							};
						}
					}
				],
				event: {
					reference: {
						mount: 'game'
					},
					interval: {
						mount: 'week',
						normalizer: (order: string | number) => {
							return parseInt(<string>order);
						}
					},
					label: {
						mount: 'date'
					}
				}
			});

			loader.load([
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-chef',
					week: '2',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56
				},
				{
					t: 'chefs',
					p: 'qb',
					name: 'Ma-Homies',
					game: 'eag-v-chef',
					week: '2',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3
				},
				{
					t: 'eagles',
					p: 'def',
					name: 'Good-Defense',
					game: 'eag-v-chef',
					week: '2',
					date: '1/1',
					passing: 12,
					attempts: 34,
					complete: 56
				},
				{
					t: 'chefs',
					p: 'def',
					name: 'Bad-Defense',
					game: 'eag-v-chef',
					week: '2',
					date: '1/1',
					passing: 1,
					attempts: 6,
					complete: 3
				},
				{
					t: 'eagles',
					p: 'qb',
					name: 'Hurts-so-good',
					game: 'eag-v-9ers',
					week: '1',
					date: '12/1',
					passing: 120,
					attempts: 40,
					complete: 30
				}
			]);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'eagles',
						type: 'team',
						weights: [],
						parentRef: undefined
					},
					{
						ref: 'qb',
						type: 'position',
						weights: [],
						parentRef: 'eagles'
					},
					{
						ref: 'Hurts-so-good',
						type: 'player',
						weights: [],
						parentRef: 'qb'
					},
					{
						ref: 'chefs',
						type: 'team',
						weights: [],
						parentRef: undefined
					},
					{
						ref: 'Ma-Homies',
						type: 'player',
						weights: [],
						parentRef: 'qb'
					},
					{
						ref: 'def',
						type: 'position',
						weights: [],
						parentRef: 'eagles'
					},
					{
						ref: 'Good-Defense',
						type: 'player',
						weights: [],
						parentRef: 'def'
					},
					{
						ref: 'Bad-Defense',
						type: 'player',
						weights: [],
						parentRef: 'def'
					}
				],
				events: [
					{
						ref: 'eag-v-chef',
						interval: 2,
						weights: {},
						edges: [
							{
								node: 'Hurts-so-good',
								weights: {
									passing: 12,
									attempts: 34,
									complete: 56
								}
							},
							{
								node: 'Ma-Homies',
								weights: {
									passing: 1,
									attempts: 6,
									complete: 3
								}
							},
							{
								node: 'Good-Defense',
								weights: {
									passing: 12,
									attempts: 34,
									complete: 56
								}
							},
							{
								node: 'Bad-Defense',
								weights: {
									passing: 1,
									attempts: 6,
									complete: 3
								}
							}
						]
					},
					{
						ref: 'eag-v-9ers',
						interval: 1,
						weights: {},
						edges: [
							{
								node: 'Hurts-so-good',
								weights: {
									passing: 120,
									attempts: 40,
									complete: 30
								}
							}
						]
					}
				]
			});
		});
	});

	describe('::fromArray', function () {
		it('should properly load a document to a graph structure', function () {
			const graph = new Graph();
			const loader = new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't'
						}
					},
					{
						type: 'position',
						reference: {
							mount: 'p'
						}
					},
					{
						type: 'player',
						reference: {
							mount: 'name'
						},
						normalizer: (row) => {
							return {
								passing: parseInt(<string>row.passing),
								attempts: parseInt(<string>row.attempts),
								complete: parseInt(<string>row.complete)
							};
						}
					}
				],
				event: {
					reference: {
						mount: 'game'
					},
					interval: {
						mount: 'week',
						normalizer: (order: string | number) => {
							return parseInt(<string>order);
						}
					},
					label: {
						mount: 'date'
					}
				}
			});

			loader.fromArray([
				[
					't',
					'p',
					'name',
					'game',
					'week',
					'date',
					'passing',
					'attempts',
					'complete'
				],
				[
					'eagles',
					'qb',
					'Hurts-so-good',
					'eag-v-chef',
					'2',
					'1/1',
					12,
					34,
					56
				],
				['chefs', 'qb', 'Ma-Homies', 'eag-v-chef', '2', '1/1', 1, 6, 3],
				[
					'eagles',
					'def',
					'Good-Defense',
					'eag-v-chef',
					'2',
					'1/1',
					12,
					34,
					56
				],
				['chefs', 'def', 'Bad-Defense', 'eag-v-chef', '2', '1/1', 1, 6, 3],
				[
					'eagles',
					'qb',
					'Hurts-so-good',
					'eag-v-9ers',
					'1',
					'12/1',
					120,
					40,
					30
				]
			]);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'eagles',
						type: 'team',
						weights: [],
						parentRef: undefined
					},
					{
						ref: 'qb',
						type: 'position',
						weights: [],
						parentRef: 'eagles'
					},
					{
						ref: 'Hurts-so-good',
						type: 'player',
						weights: [],
						parentRef: 'qb'
					},
					{
						ref: 'chefs',
						type: 'team',
						weights: [],
						parentRef: undefined
					},
					{
						ref: 'Ma-Homies',
						type: 'player',
						weights: [],
						parentRef: 'qb'
					},
					{
						ref: 'def',
						type: 'position',
						weights: [],
						parentRef: 'eagles'
					},
					{
						ref: 'Good-Defense',
						type: 'player',
						weights: [],
						parentRef: 'def'
					},
					{
						ref: 'Bad-Defense',
						type: 'player',
						weights: [],
						parentRef: 'def'
					}
				],
				events: [
					{
						ref: 'eag-v-chef',
						interval: 2,
						weights: {},
						edges: [
							{
								node: 'Hurts-so-good',
								weights: {
									passing: 12,
									attempts: 34,
									complete: 56
								}
							},
							{
								node: 'Ma-Homies',
								weights: {
									passing: 1,
									attempts: 6,
									complete: 3
								}
							},
							{
								node: 'Good-Defense',
								weights: {
									passing: 12,
									attempts: 34,
									complete: 56
								}
							},
							{
								node: 'Bad-Defense',
								weights: {
									passing: 1,
									attempts: 6,
									complete: 3
								}
							}
						]
					},
					{
						ref: 'eag-v-9ers',
						interval: 1,
						weights: {},
						edges: [
							{
								node: 'Hurts-so-good',
								weights: {
									passing: 120,
									attempts: 40,
									complete: 30
								}
							}
						]
					}
				]
			});
		});

		it('should work with multiple intervals', function () {
			const graph = new Graph();
			const loader = new GraphLoader(graph, {
				nodes: [
					{
						type: 'team',
						reference: {
							mount: 't'
						}
					},
					{
						type: 'position',
						reference: function (row) {
							return row.t + ':' + row.p;
						}
					},
					{
						type: 'player',
						reference: {
							mount: 'name'
						},
						normalizer: (row) => {
							return {
								yards: parseInt(<string>row.yards),
								other: parseInt(<string>row.other)
							};
						}
					}
				],
				event: {
					reference: {
						mount: 'game'
					},
					interval: {
						mount: 'time'
					}
				}
			});

			loader.fromArray([
				['t', 'p', 'name', 'game', 'time', 'yards', 'other'],
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
				['team-2', 'wr', 'p-2-2', 'game-4', 2, 115, 106]
			]);
		});
	});
});
