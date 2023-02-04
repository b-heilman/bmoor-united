import {Event} from './event';
import {Node} from './node';
import {NodeReference, NodeType} from './node.interface';
import {GraphJSON} from './graph.interface';
import {EventReference} from './event.interface';
import {Interval, IntervalReference} from './interval.interface';

export class Graph {
	nodes: Map<NodeReference, Node>;
	nodesByType: Map<NodeType, Node[]>;
	events: Map<EventReference, Event>;
	eventsByInterval: Map<Interval, Event[]>;
	intervals: Set<Interval>;
	sortedIntervals: Interval[];

	constructor() {
		this.nodes = new Map();
		this.nodesByType = new Map();
		this.events = new Map();
		this.eventsByInterval = new Map();
		this.intervals = new Set();
		this.sortedIntervals = null;
	}

	addNode(node: Node) {
		const hasNode = this.nodes.has(node.ref);

		if (!hasNode) {
			this.nodes.set(node.ref, node);

			const list = this.nodesByType.get(node.type);

			if (list) {
				list.push(node);
			} else {
				this.nodesByType.set(node.type, [node]);
			}
		} else {
			// TODO: throw an exception?
		}

		return this;
	}

	getNode(ref: NodeReference): Node {
		return this.nodes.get(ref);
	}

	getNodesByType(type: NodeType): Node[] {
		return this.nodesByType.get(type);
	}

	addEvent(event: Event) {
		const hasEvent = this.events.has(event.ref);

		if (!hasEvent) {
			this.events.set(event.ref, event);

			const list = this.eventsByInterval.get(event.interval);

			this.intervals.add(event.interval);
			this.sortedIntervals = null;

			if (list) {
				list.push(event);
			} else {
				this.eventsByInterval.set(event.interval, [event]);
			}
		} else {
			// TODO: throw an exception?
		}

		return this;
	}

	getEvent(ref: NodeReference): Event {
		return this.events.get(ref);
	}

	getIntervalsInOrder(
		until: Interval = null,
		from: Interval = null
	): Interval[] {
		if (!this.sortedIntervals) {
			this.sortedIntervals = Array.from(this.intervals).sort(
				(a, b) => a.ref - b.ref
			);
		}

		let intervals = this.sortedIntervals;

		if (until) {
			const fromPos = from ? intervals.indexOf(from) : 0;

			const untilPos = intervals.indexOf(until, fromPos) + 1;

			intervals = intervals.slice(fromPos, untilPos);
		}

		return intervals;
	}

	getInterval(ref: IntervalReference): Interval {
		const intervals = this.getIntervalsInOrder();

		let rtn = null;

		for (let i = 0, c = intervals.length; i < c; i++) {
			if (intervals[i].ref === ref) {
				rtn = intervals[i];
				i = c;
			}
		}

		return rtn;
	}

	getIntervalBefore(interval: Interval): Interval {
		const intervals = this.getIntervalsInOrder();
		const pos = intervals.indexOf(interval);

		if (pos < 1) {
			return null;
		} else {
			return intervals[pos - 1];
		}
	}

	getIntervalAfter(interval: Interval): Interval {
		const intervals = this.getIntervalsInOrder();
		const pos = intervals.indexOf(interval);
		const max = intervals.length - 1;

		if (pos === -1 || pos === max) {
			return null;
		} else {
			return intervals[pos + 1];
		}
	}

	getEventsInOrder(
		until: Interval = null,
		from: Interval = null
	): Event[][] {
		const intervals = this.getIntervalsInOrder(until, from);

		return intervals.map((interval) =>
			this.eventsByInterval.get(interval)
		);
	}

	toJSON(): GraphJSON {
		return {
			nodes: Array.from(this.nodes).map((nodeInfo) =>
				nodeInfo[1].toJSON()
			),
			events: Array.from(this.events).map((eventInfo) =>
				eventInfo[1].toJSON()
			)
		};
	}
}

/*
export function load(source: string): Graph {
	const schema = <GraphJSON>JSON.parse(source);
	const graph = new Graph();

	schema.nodes.map(({ ref, weights }) => {
		graph.getNode(ref).addWeights(weights);
	});

	Object.entries(schema.events).forEach(([partition, events]) => {
		events.map(({ ref, weights, edges }) => {
			graph.addEvent(ref, partition).addWeights(weights);

			edges.forEach(({ from, to, weights }) => {
				graph.connect(partition, ref, from, to).edge.addWeights(weights);
			});
		});
	});

	return graph;
}
*/
export function dump(graph: Graph): string {
	return JSON.stringify(graph, null, '\t');
}
