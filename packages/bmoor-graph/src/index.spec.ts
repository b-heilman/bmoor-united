import {expect} from 'chai';

import {Graph} from './index';

describe('@bmoor/graph', function () {
	it.only('should do nothing', function () {
		const graph = new Graph();

		graph.addEdge('team-1', 'team-2', false).weights = {
			score: 10
		};

		graph.addEdge('team-1', 'team-3', false).weights = {
			score: 10
		};

		graph.addEdge('team-1', 'team-4', false).weights = {
			score: 10
		};

		graph.addEdge('team-2', 'team-3', false).weights = {
			score: 10
		};

		graph.addEdge('team-2', 'team-4', false).weights = {
			score: -10
		};

		graph.addEdge('team-3', 'team-4', false).weights = {
			score: -10
		};

		graph.addEdge('team-3', 'team-5', false).weights = {
			score: -10
		};

		graph.addEdge('team-4', 'team-5', false).weights = {
			score: -10
		};

		graph.addEdge('team-5', 'team-1', false).weights = {
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
