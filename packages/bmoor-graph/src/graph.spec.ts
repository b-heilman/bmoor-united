import {expect} from 'chai';

import {Event} from './event';
import {Graph, dump, load} from './graph';
import {Interval} from './interval';
import {Node} from './node';

describe('@bmoor-graph::graph', function () {
	const interval1 = new Interval(1, 'time-1', ['t-1']);
	const interval2 = new Interval(2, 'time-2', ['t-2']);
	const interval3 = new Interval(4, 'time-4');
	const interval4 = new Interval(3, 'time-3', ['t-1']);

	let graph = null;

	beforeEach(function () {
		graph = new Graph();

		const event1 = new Event('event-1', interval1);
		const event2 = new Event('event-2', interval2);
		const event3 = new Event('event-3', interval1);
		const event4 = new Event('event-4', interval3);
		const event5 = new Event('event-5', interval4);

		const root = new Node('root-1', 'root');
		const second = new Node('second-1', 'second');
		const third1 = new Node('third-1', 'third');
		const third2 = new Node('third-2', 'third');

		second.setParent(interval1, root);
		third1.setParent(interval1, second);
		third2.setParent(interval1, second);

		graph.addEvent(event1);
		graph.addEvent(event2);
		graph.addEvent(event3);
		graph.addEvent(event4);
		graph.addEvent(event5);

		graph.addNode(root);
		graph.addNode(second);
		graph.addNode(third1);
		graph.addNode(third2);

		root.setWeight(interval1, 'foo', 0.6);

		event1.weights.set('hello.world', 0.7);

		third1.addEdge(event1, {foo: 123});
		third2.addEdge(event1, {bar: 123});
	});

	describe('::getNodeTpes', function () {
		it('should return back type in order', function () {
			expect(graph.getNodeTypes()).to.deep.equal([
				'root',
				'second',
				'third',
			]);
		});
	});

	describe('::getIntervalsInOrder', function () {
		it('should work with no end points', function () {
			expect(graph.getIntervalsInOrder()).to.deep.equal([
				interval1,
				interval2,
				interval4,
				interval3,
			]);
		});

		it('should work with an end', function () {
			expect(graph.getIntervalsInOrder(interval4)).to.deep.equal([
				interval1,
				interval2,
				interval4,
			]);
		});

		it('should work with an end and beginning', function () {
			expect(
				graph.getIntervalsInOrder(interval3, interval2),
			).to.deep.equal([interval2, interval4, interval3]);
		});
	});

	describe('::getIntervalsByTag', function () {
		it('should work', function () {
			expect(graph.getIntervalsByTag('t-1')).to.deep.equal([
				graph.getIntervalByPos(0),
				graph.getIntervalByPos(2),
			]);
		});
	});

	describe('::toJSON', function () {
		it('should work', function () {
			expect(graph.toJSON()).to.deep.equal({
				intervals: [
					{
						label: 'time-1',
						tags: ['t-1'],
						ref: 1,
					},
					{
						label: 'time-2',
						tags: ['t-2'],
						ref: 2,
					},
					{
						label: 'time-3',
						tags: ['t-1'],
						ref: 3,
					},
					{
						label: 'time-4',
						tags: [],
						ref: 4,
					},
				],
				nodes: [
					{
						ref: 'root-1',
						type: 'root',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								weights: {
									foo: 0.6,
								},
							},
						],
					},
					{
						ref: 'second-1',
						type: 'second',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								parentRef: 'root-1',
							},
						],
					},
					{
						ref: 'third-1',
						type: 'third',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								parentRef: 'second-1',
								edge: {
									foo: 123,
								},
							},
						],
					},
					{
						ref: 'third-2',
						type: 'third',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								parentRef: 'second-1',
								edge: {
									bar: 123,
								},
							},
						],
					},
				],
				events: [
					{
						ref: 'event-1',
						intervalRef: 1,
						weights: {
							'hello.world': 0.7,
						},
					},
					{
						ref: 'event-3',
						intervalRef: 1,
						weights: {},
					},
					{
						ref: 'event-2',
						intervalRef: 2,
						weights: {},
					},
					{
						ref: 'event-5',
						intervalRef: 3,
						weights: {},
					},
					{
						ref: 'event-4',
						intervalRef: 4,
						weights: {},
					},
				],
			});
		});
	});

	describe('dump and load', function () {
		it('should work', function () {
			const graph2 = load(dump(graph));

			expect(graph2.toJSON()).to.deep.equal({
				intervals: [
					{
						label: 'time-1',
						tags: ['t-1'],
						ref: 1,
					},
					{
						label: 'time-2',
						tags: ['t-2'],
						ref: 2,
					},
					{
						label: 'time-3',
						tags: ['t-1'],
						ref: 3,
					},
					{
						label: 'time-4',
						tags: [],
						ref: 4,
					},
				],
				nodes: [
					{
						ref: 'root-1',
						type: 'root',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								weights: {
									foo: 0.6,
								},
								edge: {},
							},
						],
					},
					{
						ref: 'second-1',
						type: 'second',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								parentRef: 'root-1',
								edge: {},
							},
						],
					},
					{
						ref: 'third-1',
						type: 'third',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								parentRef: 'second-1',
								edge: {
									foo: 123,
								},
							},
						],
					},
					{
						ref: 'third-2',
						type: 'third',
						tags: [],
						intervals: [
							{
								eventRef: 'event-1',
								intervalRef: 1,
								parentRef: 'second-1',
								edge: {
									bar: 123,
								},
							},
						],
					},
				],
				events: [
					{
						ref: 'event-1',
						intervalRef: 1,
						weights: {
							'hello.world': 0.7,
						},
					},
					{
						ref: 'event-3',
						intervalRef: 1,
						weights: {},
					},
					{
						ref: 'event-2',
						intervalRef: 2,
						weights: {},
					},
					{
						ref: 'event-5',
						intervalRef: 3,
						weights: {},
					},
					{
						ref: 'event-4',
						intervalRef: 4,
						weights: {},
					},
				],
			});
		});
	});
});
