import {expect} from 'chai';

import {Graph, load, dump} from './index';

describe('@bmoor/graph', function () {
	describe('Graph::rank', function () {
		it('should properly rank', function () {
			const graph = new Graph();

			graph
				.connect('game-1-w1', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					running: 100
				})
				.addEdgeWeight('team-2', {
					running: 65
				});

			graph
				.connect('game-1-w2', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					running: 80
				})
				.addEdgeWeight('team-2', {
					running: 120
				});

			graph
				.connect('game-2-w1', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					running: 80
				})
				.addEdgeWeight('team-4', {
					running: 70
				});

			graph
				.connect('game-2-w2', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					running: 80
				})
				.addEdgeWeight('team-4', {
					running: 70
				});

			function ranker(edgeA, edgeB) {
				return edgeA.weights.running - edgeB.weights.running;
			}

			// 3 has max total, team-1 and team-2 are equal
			expect(
				graph.rank('best-offense', ranker).map((node) => node.ref)
			).to.deep.equal(['team-3', 'team-2', 'team-1', 'team-4']);

			expect(graph.toJSON()).to.deep.equal({
				events: [
					{
						ref: 'game-1-w1',
						weights: {}
					},
					{
						ref: 'game-1-w2',
						weights: {}
					},
					{
						ref: 'game-2-w1',
						weights: {}
					},
					{
						ref: 'game-2-w2',
						weights: {}
					}
				],
				nodes: [
					{
						ref: 'team-1',
						weights: {
							'best-offense': 2
						},
						edges: [
							{
								to: 'team-2',
								event: 'game-1-w1',
								weights: {
									running: 100
								}
							},
							{
								to: 'team-2',
								event: 'game-1-w2',
								weights: {
									running: 80
								}
							}
						]
					},
					{
						ref: 'team-2',
						weights: {
							'best-offense': 3
						},
						edges: [
							{
								to: 'team-1',
								event: 'game-1-w1',
								weights: {
									running: 65
								}
							},
							{
								to: 'team-1',
								event: 'game-1-w2',
								weights: {
									running: 120
								}
							}
						]
					},
					{
						ref: 'team-3',
						weights: {
							'best-offense': 4
						},
						edges: [
							{
								to: 'team-4',
								event: 'game-2-w1',
								weights: {
									running: 80
								}
							},
							{
								to: 'team-4',
								event: 'game-2-w2',
								weights: {
									running: 80
								}
							}
						]
					},
					{
						ref: 'team-4',
						weights: {
							'best-offense': 1
						},
						edges: [
							{
								to: 'team-3',
								event: 'game-2-w1',
								weights: {
									running: 70
								}
							},
							{
								to: 'team-3',
								event: 'game-2-w2',
								weights: {
									running: 70
								}
							}
						]
					}
				]
			});
		});

		it('should properly compare', function () {
			const graph = new Graph();

			graph
				.connect('game-1', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					score: 21
				})
				.addEdgeWeight('team-2', {
					score: 10
				});

			graph
				.connect('game-2', 'team-1', 'team-3')
				.addEdgeWeight('team-1', {
					score: 21
				})
				.addEdgeWeight('team-3', {
					score: 10
				});

			graph
				.connect('game-3', 'team-1', 'team-4')
				.addEdgeWeight('team-1', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			graph
				.connect('game-4', 'team-2', 'team-3')
				.addEdgeWeight('team-2', {
					score: 21
				})
				.addEdgeWeight('team-3', {
					score: 10
				});

			graph
				.connect('game-5', 'team-2', 'team-4')
				.addEdgeWeight('team-2', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			graph
				.connect('game-6', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			graph
				.connect('game-7', 'team-3', 'team-5')
				.addEdgeWeight('team-5', {
					score: 21
				})
				.addEdgeWeight('team-3', {
					score: 10
				});

			graph
				.connect('game-8', 'team-4', 'team-5')
				.addEdgeWeight('team-5', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			function sorter(edgeA, edgeB) {
				if (edgeA) {
					// whomever won the game
					return edgeA.weights.score - edgeB.weights.score;
				} else {
					// playing less games is better
					return edgeA.to.getEdgeCount() - edgeB.to.getEdgeCount();
				}
			}

			expect(
				graph.rank('m', sorter).map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-2', 'team-3', 'team-4']);

			expect(
				graph
					.rank('m', sorter, {
						dexs: ['team-5', 'team-2', 'team-1', 'team-4', 'team-3']
					})
					.map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-2', 'team-3', 'team-4']);

			expect(
				graph
					.rank('m', sorter, {
						dexs: ['team-3', 'team-2', 'team-5', 'team-4', 'team-1']
					})
					.map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-2', 'team-3', 'team-4']);

			expect(
				graph
					.rank('m', sorter, {
						dexs: ['team-3', 'team-5', 'team-2', 'team-4', 'team-1']
					})
					.map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-5', 'team-2', 'team-3', 'team-4']);
		});

		it('should not do anything without edges', function () {
			const graph = new Graph();

			graph
				.addNode('team-1', {rank: 2})
				.addNode('team-2', {rank: 5})
				.addNode('team-3', {rank: 1})
				.addNode('team-4', {rank: 4})
				.addNode('team-5', {rank: 3});

			function ranker(nodeA, nodeB) {
				return nodeA.weights.rank - nodeB.weights.rank;
			}

			expect(
				graph.rank('m', ranker).map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-2', 'team-3', 'team-4', 'team-5']);
		});
	});

	describe('Graph::calculateNodeWeight', function () {
		it('should properly work', function () {
			const graph = new Graph();

			graph
				.connect('game-1-w1', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					running: 100
				})
				.addEdgeWeight('team-2', {
					running: 65
				});

			graph
				.connect('game-1-w2', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					running: 80
				})
				.addEdgeWeight('team-2', {
					running: 120
				});

			graph
				.connect('game-2-w1', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					running: 80
				})
				.addEdgeWeight('team-4', {
					running: 70
				});

			graph
				.connect('game-2-w2', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					running: 80
				})
				.addEdgeWeight('team-4', {
					running: 70
				});

			graph.calculateNodeWeight(
				'running-average',
				(edge) => edge.weights.running,
				{
					summarizer: (values) =>
						values.reduce((agg, value) => agg + value) / values.length
				}
			);

			expect(graph.toJSON()).to.deep.equal({
				events: [
					{
						ref: 'game-1-w1',
						weights: {}
					},
					{
						ref: 'game-1-w2',
						weights: {}
					},
					{
						ref: 'game-2-w1',
						weights: {}
					},
					{
						ref: 'game-2-w2',
						weights: {}
					}
				],
				nodes: [
					{
						ref: 'team-1',
						weights: {
							'running-average': 90
						},
						edges: [
							{
								to: 'team-2',
								event: 'game-1-w1',
								weights: {
									running: 100
								}
							},
							{
								to: 'team-2',
								event: 'game-1-w2',
								weights: {
									running: 80
								}
							}
						]
					},
					{
						ref: 'team-2',
						weights: {
							'running-average': 92.5
						},
						edges: [
							{
								to: 'team-1',
								event: 'game-1-w1',
								weights: {
									running: 65
								}
							},
							{
								to: 'team-1',
								event: 'game-1-w2',
								weights: {
									running: 120
								}
							}
						]
					},
					{
						ref: 'team-3',
						weights: {
							'running-average': 80
						},
						edges: [
							{
								to: 'team-4',
								event: 'game-2-w1',
								weights: {
									running: 80
								}
							},
							{
								to: 'team-4',
								event: 'game-2-w2',
								weights: {
									running: 80
								}
							}
						]
					},
					{
						ref: 'team-4',
						weights: {
							'running-average': 70
						},
						edges: [
							{
								to: 'team-3',
								event: 'game-2-w1',
								weights: {
									running: 70
								}
							},
							{
								to: 'team-3',
								event: 'game-2-w2',
								weights: {
									running: 70
								}
							}
						]
					}
				]
			});
		});
	});

	describe('Graph::sort', function () {
		it('should sort like a normal array would', function () {
			const graph = new Graph();

			graph.addNode('foo', {value: 1});
			graph.addNode('bar', {value: 2});

			expect(
				graph
					.sort('sort-1', (a, b) => a.weights.value - b.weights.value)
					.array.map((node) => node.ref)
			).to.deep.equal(['foo', 'bar']);

			expect(
				graph
					.sort('sort-2', (a, b) => b.weights.value - a.weights.value)
					.array.map((node) => node.ref)
			).to.deep.equal(['bar', 'foo']);

			expect(
				graph
					.sort('sort-3', (b, a) => a.weights.value - b.weights.value)
					.array.map((node) => node.ref)
			).to.deep.equal(['bar', 'foo']);

			expect(graph.getNode('foo').weights['sort-1']).to.equal(2);
			expect(graph.getNode('foo').weights['sort-2']).to.equal(1);
			expect(graph.getNode('foo').weights['sort-3']).to.equal(1);
		});
	});

	describe('Graph::calculateGraphWeight', function () {
		it('should properly work', function () {
			const graph = new Graph();

			graph
				.connect('game-1-w1', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					running: 100
				})
				.addEdgeWeight('team-2', {
					running: 65
				});

			graph
				.connect('game-1-w2', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					running: 80
				})
				.addEdgeWeight('team-2', {
					running: 120
				});

			graph
				.connect('game-2-w1', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					running: 80
				})
				.addEdgeWeight('team-4', {
					running: 70
				});

			graph
				.connect('game-2-w2', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					running: 80
				})
				.addEdgeWeight('team-4', {
					running: 70
				});

			graph.calculateGraphWeight(
				'running-average',
				(edge) => edge.weights.running,
				{
					summarizer: (values) =>
						values.reduce((agg, value) => agg + value) / values.length
				}
			);

			expect(graph.weights['running-average']).to.deep.equal(83.125);
		});
	});

	describe('Graph -> dump/load', function () {
		it('should work', function () {
			const graph = new Graph();

			graph
				.connect('game-1', 'team-1', 'team-2')
				.addEdgeWeight('team-1', {
					score: 21
				})
				.addEdgeWeight('team-2', {
					score: 10
				});

			graph
				.connect('game-2', 'team-1', 'team-3')
				.addEdgeWeight('team-1', {
					score: 21
				})
				.addEdgeWeight('team-3', {
					score: 10
				});

			graph
				.connect('game-3', 'team-1', 'team-4')
				.addEdgeWeight('team-1', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			graph
				.connect('game-4', 'team-2', 'team-3')
				.addEdgeWeight('team-2', {
					score: 21
				})
				.addEdgeWeight('team-3', {
					score: 10
				});

			graph
				.connect('game-5', 'team-2', 'team-4')
				.addEdgeWeight('team-2', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			graph
				.connect('game-6', 'team-3', 'team-4')
				.addEdgeWeight('team-3', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			graph
				.connect('game-7', 'team-3', 'team-5')
				.addEdgeWeight('team-5', {
					score: 21
				})
				.addEdgeWeight('team-3', {
					score: 10
				});

			graph
				.connect('game-8', 'team-4', 'team-5')
				.addEdgeWeight('team-5', {
					score: 21
				})
				.addEdgeWeight('team-4', {
					score: 10
				});

			const oGraph = load(dump(graph));

			expect(oGraph.toJSON()).to.deep.equal(graph.toJSON());
		});
	});
});
