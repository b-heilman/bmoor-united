import {expect} from 'chai';

import {Graph} from './index';

describe('@bmoor/graph', function () {
	describe('Graph::sort', function () {
		it('should work simply', function () {
			const graph = new Graph();

			graph.addEdge('team-1', 'team-2').weights = {
				score: 10
			};

			graph.addEdge('team-1', 'team-3').weights = {
				score: 10
			};

			graph.addEdge('team-1', 'team-4').weights = {
				score: 10
			};

			graph.addEdge('team-2', 'team-3').weights = {
				score: 10
			};

			graph.addEdge('team-2', 'team-4').weights = {
				score: -10
			};

			graph.addEdge('team-3', 'team-4').weights = {
				score: -10
			};

			graph.addEdge('team-3', 'team-5').weights = {
				score: -10
			};

			graph.addEdge('team-4', 'team-5').weights = {
				score: -10
			};

			graph.addEdge('team-5', 'team-1').weights = {
				score: -10
			};

			function sorter(edge, nodeA, nodeB) {
				if (edge) {
					return edge.weights.score;
				} else {
					return nodeB.weight - nodeA.weight;
				}
			}

			expect(graph.sort(sorter).map((node) => node.ref)).to.deep.equal([
				'team-1',
				'team-5',
				'team-4',
				'team-2',
				'team-3'
			]);

			expect(
				graph
					.sort(sorter, ['team-5', 'team-2', 'team-1', 'team-4', 'team-3'])
					.map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-4', 'team-2', 'team-3']);

			expect(
				graph
					.sort(sorter, ['team-3', 'team-2', 'team-5', 'team-4', 'team-1'])
					.map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-4', 'team-2', 'team-3']);

			expect(
				graph
					.sort(sorter, ['team-3', 'team-5', 'team-2', 'team-4', 'team-1'])
					.map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-4', 'team-2', 'team-3']);
		});
	});

	describe('Graph::rank', function () {
		it('should properly rank', function () {
			const graph = new Graph();

			graph.addEvent('week-1', 'team-1', 'team-2').weights = {
				running: 100
			};

			graph.addEvent('week-2', 'team-1', 'team-2').weights = {
				running: 80
			};

			graph.addEvent('week-1', 'team-2', 'team-1').weights = {
				running: 65
			};

			graph.addEvent('week-2', 'team-2', 'team-1').weights = {
				running: 120
			};

			graph.addEvent('week-1', 'team-3', 'team-4').weights = {
				running: 80
			};

			graph.addEvent('week-2', 'team-3', 'team-4').weights = {
				running: 80
			};

			graph.addEvent('week-1', 'team-4', 'team-3').weights = {
				running: 70
			};

			graph.addEvent('week-2', 'team-4', 'team-3').weights = {
				running: 70
			};

			function ranker(event) {
				return event.weights.running;
			}

			expect(
				graph.rank('best-offense', ranker).map(({node}) => node.ref)
			).to.deep.equal(['team-2', 'team-1', 'team-3', 'team-4']);
		});
	});
});
