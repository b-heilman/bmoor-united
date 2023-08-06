/*
import {expect} from 'chai';

import {Features} from './weighted.interface';
import {Graph, load, dump} from './index';

function pair(
	graph: Graph,
	partition: string,
	eventRef: string,
	fromRef: string,
	fromWeight: Features,
	toRef: string,
	toWeight: Features
) {
	graph
		.connect(partition, eventRef, fromRef, toRef)
		.event.addFeatures(fromWeight);

	graph
		.connect(partition, eventRef, toRef, fromRef)
		.event.addFeatures(toWeight);
}

describe('@bmoor/graph', function () {
	describe('Graph::rank', function () {
		it('should properly rank', function () {
			const graph = new Graph();

			pair(
				graph,
				'w1',
				'game-1',
				'team-1',
				{
					running: 100
				},
				'team-2',
				{
					running: 65
				}
			);

			pair(
				graph,
				'w2',
				'game-1',
				'team-1',
				{
					running: 80
				},
				'team-2',
				{
					running: 120
				}
			);

			pair(
				graph,
				'w1',
				'game-2',
				'team-3',
				{
					running: 80
				},
				'team-4',
				{
					running: 70
				}
			);

			pair(
				graph,
				'w2',
				'game-2',
				'team-3',
				{
					running: 80
				},
				'team-4',
				{
					running: 70
				}
			);

			function ranker(eventA, eventB) {
				return eventA.features.running - eventB.features.running;
			}

			// 3 has max total, team-1 and team-2 are equal
			expect(
				graph.rank('best-offense', ranker).map((node) => node.ref)
			).to.deep.equal(['team-3', 'team-2', 'team-1', 'team-4']);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'team-1',
						features: {
							'best-offense': 2
						}
					},
					{
						ref: 'team-2',
						features: {
							'best-offense': 3
						}
					},
					{
						ref: 'team-3',
						features: {
							'best-offense': 4
						}
					},
					{
						ref: 'team-4',
						features: {
							'best-offense': 1
						}
					}
				],
				events: {
					w1: [
						{
							ref: 'game-1',
							features: {},
							events: [
								{
									from: 'team-1',
									to: 'team-2',
									features: {
										running: 100
									}
								},
								{
									from: 'team-2',
									to: 'team-1',
									features: {
										running: 65
									}
								}
							]
						},
						{
							ref: 'game-2',
							features: {},
							events: [
								{
									from: 'team-3',
									to: 'team-4',
									features: {
										running: 80
									}
								},
								{
									from: 'team-4',
									to: 'team-3',
									features: {
										running: 70
									}
								}
							]
						}
					],
					w2: [
						{
							ref: 'game-1',
							features: {},
							events: [
								{
									from: 'team-1',
									to: 'team-2',
									features: {
										running: 80
									}
								},
								{
									from: 'team-2',
									to: 'team-1',
									features: {
										running: 120
									}
								}
							]
						},
						{
							ref: 'game-2',
							features: {},
							events: [
								{
									from: 'team-3',
									to: 'team-4',
									features: {
										running: 80
									}
								},
								{
									from: 'team-4',
									to: 'team-3',
									features: {
										running: 70
									}
								}
							]
						}
					]
				}
			});
		});

		it('should properly compare', function () {
			const graph = new Graph();

			pair(
				graph,
				'w1',
				'game-1',
				'team-1',
				{
					score: 21
				},
				'team-2',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-2',
				'team-1',
				{
					score: 21
				},
				'team-3',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-3',
				'team-1',
				{
					score: 21
				},
				'team-4',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-4',
				'team-2',
				{
					score: 21
				},
				'team-3',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-5',
				'team-2',
				{
					score: 21
				},
				'team-4',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-6',
				'team-3',
				{
					score: 21
				},
				'team-4',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-7',
				'team-3',
				{
					score: 10
				},
				'team-5',
				{
					score: 21
				}
			);

			pair(
				graph,
				'w1',
				'game-8',
				'team-4',
				{
					score: 10
				},
				'team-5',
				{
					score: 21
				}
			);

			function sorter(eventA, eventB) {
				if (eventA) {
					// whomever won the game
					return eventA.features.score - eventB.features.score;
				} else {
					// playing less games is better
					return eventA.to.getEventCount() - eventB.to.getEventCount();
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

		it('should not do anything without events', function () {
			const graph = new Graph();

			graph
				.addNode('team-1', {rank: 2})
				.addNode('team-2', {rank: 5})
				.addNode('team-3', {rank: 1})
				.addNode('team-4', {rank: 4})
				.addNode('team-5', {rank: 3});

			function ranker(nodeA, nodeB) {
				return nodeA.features.rank - nodeB.features.rank;
			}

			expect(
				graph.rank('m', ranker).map((node) => node.ref)
			).to.deep.equal(['team-1', 'team-2', 'team-3', 'team-4', 'team-5']);
		});
	});

	describe('Graph::calculateNodeWeight', function () {
		it('should properly work', function () {
			const graph = new Graph();

			pair(
				graph,
				'w1',
				'game-1',
				'team-1',
				{
					running: 100
				},
				'team-2',
				{
					running: 65
				}
			);

			pair(
				graph,
				'w2',
				'game-1',
				'team-1',
				{
					running: 80
				},
				'team-2',
				{
					running: 120
				}
			);

			pair(
				graph,
				'w1',
				'game-2',
				'team-3',
				{
					running: 80
				},
				'team-4',
				{
					running: 70
				}
			);

			pair(
				graph,
				'w2',
				'game-2',
				'team-3',
				{
					running: 80
				},
				'team-4',
				{
					running: 70
				}
			);

			graph.calculateNodeWeight(
				'running-average',
				(event) => event.features.running,
				{
					summarizer: (values) =>
						values.reduce((agg, value) => agg + value) / values.length
				}
			);

			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'team-1',
						features: {
							'running-average': 90
						}
					},
					{
						ref: 'team-2',
						features: {
							'running-average': 92.5
						}
					},
					{
						ref: 'team-3',
						features: {
							'running-average': 80
						}
					},
					{
						ref: 'team-4',
						features: {
							'running-average': 70
						}
					}
				],
				events: {
					w1: [
						{
							ref: 'game-1',
							features: {},
							events: [
								{
									from: 'team-1',
									to: 'team-2',
									features: {
										running: 100
									}
								},
								{
									from: 'team-2',
									to: 'team-1',
									features: {
										running: 65
									}
								}
							]
						},
						{
							ref: 'game-2',
							features: {},
							events: [
								{
									from: 'team-3',
									to: 'team-4',
									features: {
										running: 80
									}
								},
								{
									from: 'team-4',
									to: 'team-3',
									features: {
										running: 70
									}
								}
							]
						}
					],
					w2: [
						{
							ref: 'game-1',
							features: {},
							events: [
								{
									from: 'team-1',
									to: 'team-2',
									features: {
										running: 80
									}
								},
								{
									from: 'team-2',
									to: 'team-1',
									features: {
										running: 120
									}
								}
							]
						},
						{
							ref: 'game-2',
							features: {},
							events: [
								{
									from: 'team-3',
									to: 'team-4',
									features: {
										running: 80
									}
								},
								{
									from: 'team-4',
									to: 'team-3',
									features: {
										running: 70
									}
								}
							]
						}
					]
				}
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
					.sort('sort-1', (a, b) => a.features.value - b.features.value)
					.array.map((node) => node.ref)
			).to.deep.equal(['foo', 'bar']);

			expect(
				graph
					.sort('sort-2', (a, b) => b.features.value - a.features.value)
					.array.map((node) => node.ref)
			).to.deep.equal(['bar', 'foo']);

			expect(
				graph
					.sort('sort-3', (b, a) => a.features.value - b.features.value)
					.array.map((node) => node.ref)
			).to.deep.equal(['bar', 'foo']);

			expect(graph.getNode('foo').features['sort-1']).to.equal(2);
			expect(graph.getNode('foo').features['sort-2']).to.equal(1);
			expect(graph.getNode('foo').features['sort-3']).to.equal(1);
		});
	});

	describe('Graph::calculateGraphWeight', function () {
		it('should properly work', function () {
			const graph = new Graph();

			pair(
				graph,
				'w1',
				'game-1',
				'team-1',
				{
					running: 100
				},
				'team-2',
				{
					running: 65
				}
			);

			pair(
				graph,
				'w2',
				'game-1',
				'team-1',
				{
					running: 80
				},
				'team-2',
				{
					running: 120
				}
			);

			pair(
				graph,
				'w1',
				'game-2',
				'team-3',
				{
					running: 80
				},
				'team-4',
				{
					running: 70
				}
			);

			pair(
				graph,
				'w2',
				'game-2',
				'team-3',
				{
					running: 80
				},
				'team-4',
				{
					running: 70
				}
			);

			graph.calculateGraphWeight(
				'running-average',
				(event) => event.features.running,
				{
					summarizer: (values) =>
						values.reduce((agg, value) => agg + value) / values.length
				}
			);

			expect(graph.features['running-average']).to.deep.equal(83.125);
		});
	});

	describe('Graph -> dump/load', function () {
		it('should work', function () {
			const graph = new Graph();

			pair(
				graph,
				'w1',
				'game-1',
				'team-1',
				{
					score: 21
				},
				'team-2',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-2',
				'team-1',
				{
					score: 21
				},
				'team-3',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-3',
				'team-1',
				{
					score: 21
				},
				'team-4',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-4',
				'team-2',
				{
					score: 21
				},
				'team-3',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-5',
				'team-2',
				{
					score: 21
				},
				'team-4',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-6',
				'team-3',
				{
					score: 21
				},
				'team-4',
				{
					score: 10
				}
			);

			pair(
				graph,
				'w1',
				'game-7',
				'team-3',
				{
					score: 10
				},
				'team-5',
				{
					score: 21
				}
			);

			pair(
				graph,
				'w1',
				'game-8',
				'team-4',
				{
					score: 10
				},
				'team-5',
				{
					score: 21
				}
			);

			const oGraph = load(dump(graph));

			expect(oGraph.toJSON()).to.deep.equal(graph.toJSON());
		});
	});
});
*/
