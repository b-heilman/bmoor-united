import {expect} from 'chai';

/**
 * I want to focus my tests on my gambling AI I'm tinkering with.
 */
import {Graph} from '../graph';
import {GraphLoader} from './loader';
import {GraphSelection} from './selection';
import {Weights} from '../weights';

describe('bmoor-graph::GraphSelection', function () {
	let graph = null;

	beforeEach(function () {
		graph = new Graph();
		const loader = new GraphLoader(graph, {
			nodes: [
				{
					type: 'team',
					reference: {
						mount: 't'
					},
					normalizer: (row) => {
						return {
							score: parseInt(<string>row.score)
						};
					}
				},
				{
					type: 'position',
					tag: {
						mount: 'p'
					},
					reference: function (row) {
						return row.t + ':' + row.p;
					}
				},
				{
					type: 'player',
					reference: {
						mount: 'name'
					},
					tag: {
						mount: 'p'
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
			['t', 'p', 'name', 'game', 'time', 'yards', 'other', 'score'],
			['team-1', 'qb', 'p-1-1', 'game-1', 1, 100, 112, 21],
			['team-1', 'wr', 'p-1-2', 'game-1', 1, 101, 101, 21],
			['team-2', 'qb', 'p-2-1', 'game-1', 1, 102, 103, 14],
			['team-2', 'wr', 'p-2-2', 'game-1', 1, 103, 111, 14],
			['team-3', 'qb', 'p-3-1', 'game-2', 1, 104, 100, 7],
			['team-3', 'wr', 'p-3-2', 'game-2', 1, 105, 102, 7],
			['team-4', 'qb', 'p-4-1', 'game-2', 1, 106, 115, 24],
			['team-4', 'wr', 'p-4-2', 'game-2', 1, 107, 113, 24],
			['team-1', 'qb', 'p-1-1', 'game-3', 2, 108, 104, 49],
			['team-1', 'wr', 'p-1-2', 'game-3', 2, 109, 105, 49],
			['team-3', 'qb', 'p-3-1', 'game-3', 2, 110, 110, 13],
			['team-3', 'wr', 'p-3-2', 'game-3', 2, 111, 108, 13],
			['team-4', 'qb', 'p-4-1', 'game-4', 2, 112, 107, 21],
			['team-4', 'wr', 'p-4-2', 'game-4', 2, 113, 114, 21],
			['team-2', 'qb', 'p-2-1', 'game-4', 2, 114, 109, 14],
			['team-2', 'wr', 'p-2-2', 'game-4', 2, 115, 106, 14]
		]);
	});

	describe('::selection', function () {
		it('should filter by type', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'player'
			});

			expect(select.nodes).to.deep.equal([
				graph.getNode('p-1-1'),
				graph.getNode('p-1-2'),
				graph.getNode('p-2-1'),
				graph.getNode('p-2-2'),
				graph.getNode('p-3-1'),
				graph.getNode('p-3-2'),
				graph.getNode('p-4-1'),
				graph.getNode('p-4-2')
			]);
		});

		it('should filter by type and tag', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'position',
				tag: 'qb'
			});

			expect(select.nodes).to.deep.equal([
				graph.getNode('team-1:qb'),
				graph.getNode('team-2:qb'),
				graph.getNode('team-3:qb'),
				graph.getNode('team-4:qb')
			]);
		});

		it('should filter and allow sub selects', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'position'
			}).subSelect({tag: 'qb'});

			expect(select.nodes).to.deep.equal([
				graph.getNode('team-1:qb'),
				graph.getNode('team-2:qb'),
				graph.getNode('team-3:qb'),
				graph.getNode('team-4:qb')
			]);
		});
	});

	describe('::transfer', function () {
		it('should properly copy from edge to node weight', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(1),
				type: 'player'
			});

			select.transfer('yards', 'to');
			select.transfer('other');

			expect(
				graph.getNode('p-1-1').getWeights(graph.getInterval(1)).get('to')
			).to.deep.equal(100);

			expect(
				graph
					.getNode('p-2-2')
					.getWeights(graph.getInterval(1))
					.get('other')
			).to.deep.equal(111);
		});

		it('should allow sort by subSelect after transfer', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(1),
				type: 'player'
			});

			select.transfer('yards', 'to');
			select.transfer('other');

			const sub1 = select.subSelect({
				sort: (a: Weights, b: Weights) => b.get('to') - a.get('to')
			});

			const sub2 = select.subSelect({
				sort: (a: Weights, b: Weights) => b.get('other') - a.get('other')
			});

			expect(sub1.nodes).to.deep.equal([
				graph.getNode('p-4-2'),
				graph.getNode('p-4-1'),
				graph.getNode('p-3-2'),
				graph.getNode('p-3-1'),
				graph.getNode('p-2-2'),
				graph.getNode('p-2-1'),
				graph.getNode('p-1-2'),
				graph.getNode('p-1-1')
			]);

			expect(sub2.nodes).to.deep.equal([
				graph.getNode('p-4-1'),
				graph.getNode('p-4-2'),
				graph.getNode('p-1-1'),
				graph.getNode('p-2-2'),
				graph.getNode('p-2-1'),
				graph.getNode('p-3-2'),
				graph.getNode('p-1-2'),
				graph.getNode('p-3-1')
			]);
		});

		it('should allow sort after transfer', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(1),
				type: 'player'
			});

			select.transfer('other');

			select.sort(
				(a: Weights, b: Weights) => b.get('other') - a.get('other')
			);

			expect(select.sorted).to.equal(true);
			expect(select.nodes).to.deep.equal([
				graph.getNode('p-4-1'),
				graph.getNode('p-4-2'),
				graph.getNode('p-1-1'),
				graph.getNode('p-2-2'),
				graph.getNode('p-2-1'),
				graph.getNode('p-3-2'),
				graph.getNode('p-1-2'),
				graph.getNode('p-3-1')
			]);

			const top = select.top(3);
			const bottom = select.bottom(3);

			expect(top.nodes).to.deep.equal([
				graph.getNode('p-4-1'),
				graph.getNode('p-4-2'),
				graph.getNode('p-1-1')
			]);

			expect(bottom.nodes).to.deep.equal([
				graph.getNode('p-3-2'),
				graph.getNode('p-1-2'),
				graph.getNode('p-3-1')
			]);
		});

		it('should allow sort after transfer on another interval', function () {
			const select = new GraphSelection(graph, {
				interval: graph.getInterval(2),
				type: 'player'
			});

			select.transfer('other');

			select.sort(
				(a: Weights, b: Weights) => b.get('other') - a.get('other')
			);

			expect(select.sorted).to.equal(true);
			expect(select.nodes).to.deep.equal([
				graph.getNode('p-4-2'),
				graph.getNode('p-3-1'),
				graph.getNode('p-2-1'),
				graph.getNode('p-3-2'),
				graph.getNode('p-4-1'),
				graph.getNode('p-2-2'),
				graph.getNode('p-1-2'),
				graph.getNode('p-1-1')
			]);

			const top = select.top(3);
			const bottom = select.bottom(3);

			expect(top.nodes).to.deep.equal([
				graph.getNode('p-4-2'),
				graph.getNode('p-3-1'),
				graph.getNode('p-2-1')
			]);

			expect(bottom.nodes).to.deep.equal([
				graph.getNode('p-2-2'),
				graph.getNode('p-1-2'),
				graph.getNode('p-1-1')
			]);
		});
	});

	describe('::rank', function () {
		describe('on low level nodes', function(){
			it('should allow you to compute a rank on the first interval', function () {
				const select = new GraphSelection(graph, {
					interval: graph.getInterval(1),
					type: 'player',
					tag: 'qb'
				});

				select.transfer('yards');

				select.rank((weightsA, weightsB) => {
					return weightsA.get('yards') - weightsB.get('yards');
				});

				// we utilize a tie breaker
				expect(select.nodes).to.deep.equal([
					graph.getNode('p-4-1'),
					graph.getNode('p-2-1'),
					graph.getNode('p-3-1'),
					graph.getNode('p-1-1')
				]);
			});
	
			it('should allow you to compute a rank on the last interval', function () {
				const select = new GraphSelection(graph, {
					interval: graph.getInterval(2),
					type: 'player',
					tag: 'qb'
				});

				select.transfer('yards');

				select.rank((weightsA, weightsB) => {
					return weightsA.get('yards') - weightsB.get('yards');
				});

				// This works as the teams play two games, allowing it to be deterministic
				expect(select.nodes).to.deep.equal([
					graph.getNode('p-2-1'),
					graph.getNode('p-4-1'),
					graph.getNode('p-3-1'),
					graph.getNode('p-1-1')
				]);
			});
		});

		describe('on top level nodes', function(){
			it('should allow you to compute a rank on the first interval', function () {
				const select = new GraphSelection(graph, {
					interval: graph.getInterval(1),
					type: 'team'
				});

				select.transfer('score');

				select.rank((weightsA, weightsB) => {
					return weightsA.get('score') - weightsB.get('score');
				});

				expect(select.nodes).to.deep.equal([
					graph.getNode('team-4'),
					graph.getNode('team-1'),
					graph.getNode('team-2'),
					graph.getNode('team-3')
				]);

				select.setPositionAsWeight('pos');

				expect(graph.getNode('team-1').getWeight(graph.getInterval(1), 'pos'))
				.to.equal(3);

				expect(graph.getNode('team-1').getWeight(graph.getInterval(2), 'pos'))
				.to.equal(null);
			});
	
			it('should allow you to compute a rank on the last interval', function () {
				const select = new GraphSelection(graph, {
					interval: graph.getInterval(2),
					type: 'team'
				});

				select.transfer('score');

				select.rank((weightsA, weightsB) => {
					return weightsA.get('score') - weightsB.get('score');
				});

				expect(select.nodes).to.deep.equal([
					graph.getNode('team-1'),
					graph.getNode('team-4'),
					graph.getNode('team-2'),
					graph.getNode('team-3')
				]);

				select.setPositionAsWeight('pos');

				expect(graph.getNode('team-4').getWeight(graph.getInterval(1), 'pos'))
				.to.equal(null);

				expect(graph.getNode('team-4').getWeight(graph.getInterval(2), 'pos'))
				.to.equal(3);
			});
		});
		
	});
});
