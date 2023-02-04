import {expect} from 'chai';

/**
 * I want to focus my tests on my gambling AI I'm tinkering with.
 */
import {Graph} from '../graph';
import {GraphLoader} from './loader';

describe('bmoor-graph::GraphCalculator', function () {
	let graph = null;

	beforeEach(function () {
		graph = new Graph();
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

	describe('selector', function () {
		it('should work', function () {
			expect(true).to.equal(false);
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
