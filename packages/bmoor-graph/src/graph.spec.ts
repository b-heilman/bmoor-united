import {expect} from 'chai';

import {Event} from './event';
import {Edge} from './edge';
import {Node} from './node';
import {Graph} from './graph';

describe('@bmoor-graph::graph', function () {
	const interval1 = {ref: 1, label: 'time-1'};
	const interval2 = {ref: 2, label: 'time-2'};
	const interval3 = {ref: 4, label: 'time-4'};
	const interval4 = {ref: 3, label: 'time-3'};

	let graph = null;

	beforeEach(function () {
		graph = new Graph();

		const event1 = new Event('event-1', interval1);
		const event2 = new Event('event-2', interval2);
		const event3 = new Event('event-3', interval1);
		const event4 = new Event('event-4', interval3);
		const event5 = new Event('event-5', interval4);

		const root = new Node('root-1', 'root');
		const second = new Node('second-1', 'second', {parent: root});
		const third1 = new Node('third-1', 'third', {parent: second});
		const third2 = new Node('third-2', 'third', {parent: second});

		const edge1 = new Edge(third1);
		const edge2 = new Edge(third1);
		const edge3 = new Edge(third1);
		const edge4 = new Edge(third2);

		graph.addEvent(event1);
		event1.addEdge(edge1);

		graph.addEvent(event2);
		event2.addEdge(edge2);

		graph.addEvent(event3);
		event3.addEdge(edge3);
		event3.addEdge(edge4);

		graph.addEvent(event4);
		graph.addEvent(event5);

		graph.addNode(root);
		graph.addNode(second);
		graph.addNode(third1);
		graph.addNode(third2);

		root.setWeight(interval1, 'foo', 0.6);

		event1.weights.set('hello.world', 0.7);
		edge4.weights.set('bar', 1.2);
	});

	describe('::getIntervalsInOrder', function () {
		it('should work with no end points', function () {
			expect(graph.getIntervalsInOrder()).to.deep.equal([
				interval1,
				interval2,
				interval4,
				interval3
			]);
		});

		it('should work with an end', function () {
			expect(graph.getIntervalsInOrder(interval4)).to.deep.equal([
				interval1,
				interval2,
				interval4
			]);
		});

		it('should work with an end and beginning', function () {
			expect(
				graph.getIntervalsInOrder(interval3, interval2)
			).to.deep.equal([interval2, interval4, interval3]);
		});
	});

	describe('::toJSON', function () {
		it('should work', function () {
			expect(graph.toJSON()).to.deep.equal({
				nodes: [
					{
						ref: 'root-1',
						type: 'root',
						weights: [
							{
								interval: 1,
								data: {
									foo: 0.6
								}
							}
						],
						parentRef: undefined
					},
					{
						ref: 'second-1',
						type: 'second',
						weights: [],
						parentRef: 'root-1'
					},
					{
						ref: 'third-1',
						type: 'third',
						weights: [],
						parentRef: 'second-1'
					},
					{
						ref: 'third-2',
						type: 'third',
						weights: [],
						parentRef: 'second-1'
					}
				],
				events: [
					{
						ref: 'event-1',
						interval: 1,
						weights: {
							'hello.world': 0.7
						},
						edges: [
							{
								node: 'third-1',
								weights: {}
							}
						]
					},
					{
						ref: 'event-2',
						interval: 2,
						weights: {},
						edges: [
							{
								node: 'third-1',
								weights: {}
							}
						]
					},
					{
						ref: 'event-3',
						interval: 1,
						weights: {},
						edges: [
							{
								node: 'third-1',
								weights: {}
							},
							{
								node: 'third-2',
								weights: {
									bar: 1.2
								}
							}
						]
					},
					{
						ref: 'event-4',
						interval: 4,
						weights: {},
						edges: []
					},
					{
						ref: 'event-5',
						interval: 3,
						weights: {},
						edges: []
					}
				]
			});
		});
	});
});
