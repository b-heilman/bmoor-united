import {expect} from 'chai';

/**
 * I want to focus my tests on my gambling AI I'm tinkering with.
 */
import {Graph} from '../graph';
import {GraphCalculator} from './calculator';
import {GraphLoader} from './loader';
import {GraphSelection} from './selection';

describe('bmoor-graph::GraphCalculator', function () {
	let graph = null;

	beforeEach(function () {
		graph = new Graph();
		const loader = new GraphLoader(graph, {
			nodes: [
				{
					type: 'team',
					reference: {
						mount: 't',
					},
				},
				{
					type: 'position',
					reference: function (row) {
						return row.t + ':' + row.p;
					},
				},
				{
					type: 'player',
					reference: {
						mount: 'name',
					},
					normalizer: (row) => {
						return {
							yards: parseInt(<string>row.yards),
							other: parseInt(<string>row.other),
						};
					},
				},
			],
			event: {
				reference: {
					mount: 'game',
				},
				interval: {
					mount: 'time',
				},
			},
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
			['team-2', 'wr', 'p-2-2', 'game-4', 2, 115, 106],
		]);
	});

	describe('intervalSum', function () {
		it('should calculate a sum for a node over time', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'player',
			});

			const calculator = new GraphCalculator(select);

			calculator.intervalSum('yards', 'total_yards');

			expect(
				graph
					.getNode('p-1-1')
					.getWeight(graph.getInterval(1), 'total_yards'),
			).to.equal(100);

			expect(
				graph
					.getNode('p-1-1')
					.getWeight(graph.getInterval(2), 'total_yards'),
			).to.equal(208);
		});
	});

	describe('bubbleSum', function () {
		it('should calculate a sum for a node over all its children', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'player',
			});

			const calculator = new GraphCalculator(select);

			calculator.intervalSum('yards', 'total_yards');

			const select2 = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'team',
			});

			const calculator2 = new GraphCalculator(select2);

			calculator2.bubbleSum('total_yards');

			expect(
				graph
					.getNode('team-1')
					.getWeight(graph.getInterval(1), 'total_yards'),
			).to.equal(null);

			expect(
				graph
					.getNode('team-1')
					.getWeight(graph.getInterval(2), 'total_yards'),
			).to.equal(418);

			expect(
				graph
					.getNode('team-2')
					.getWeight(graph.getInterval(2), 'total_yards'),
			).to.equal(434);
		});
	});
});
/**
 * I want to be able to calculate team totals for the season, up until a point.  So sum all the values
 * for a team for all events between a period.
 */

/**
 * I want to be able to calculate team rankings
 */

/**
 * I want to be able to sort teams based on a metric
 */

/**
 * I want to be able to calculate stats against, for instance runs against are def yards allowed
 */
