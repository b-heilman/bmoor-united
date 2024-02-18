import {Event} from './event';
import {EventReference} from './event.interface';
import {GraphJSON} from './graph.interface';
import {Interval} from './interval';
import {IntervalReference} from './interval.interface';
import {Node} from './node';
import {NodeReference, NodeType} from './node.interface';

export class Graph {
	nodes: Map<NodeReference, Node>;
	nodesByType: Map<NodeType, Node[]>;
	nodeTags: Tagging<Node>;
	events: Map<EventReference, Event>;
	eventsByInterval: Map<Interval, Event[]>;
	intervals: Map<number, Interval>;
	intervalTags: Tagging<Interval>;
	sortedIntervals: Interval[];
	isTop: boolean;
	sortedTypes: string[];

	constructor() {
		this.nodes = new Map();
		this.nodesByType = new Map();
		this.nodeTags = new Tagging<Node>();
		this.events = new Map();
		this.eventsByInterval = new Map();
		this.intervals = new Map();
		this.intervalTags = new Tagging<Interval>();
		this.sortedTypes = null;
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

			this.nodeTags.add(node, node.tags);
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

	getInterval(ref: IntervalReference): Interval {
		return this.intervals.get(ref);
	}

	getNodeTypes(): string[] {
		// This method assumes that every node will be connected to another
		// node at some point, and this order is stable.  So if I select
		// all node types, and search for where they have parents
		if (!this.sortedTypes) {
			const intervals = this.getIntervalsInOrder();
			const types = Array.from(this.nodesByType.keys());
			const references = {};
			const roots = [];

			for (const type of types) {
				const node = this.nodesByType.get(type)[0];

				for (let i = 0, c = intervals.length; i < c; i++) {
					const interval = intervals[i];

					const has = node.hasIntervalData(interval);
					if (has) {
						const info = node.getIntervalData(interval);

						if (info.parent) {
							i = c;

							const pType = info.parent.type;

							if (references[pType]) {
								references[pType].push(type);
							} else {
								references[pType] = [type];
							}

							continue;
						}
					}

					if (i === c - 1) {
						// we have found no parents...
						roots.push(type);
					}
				}
			}

			let todo = roots;
			this.sortedTypes = [];
			while (todo.length) {
				this.sortedTypes.push(...todo);

				const search = [];

				for (const type of todo) {
					if (type in references) {
						search.push(...references[type]);
					}
				}

				todo = search;
			}
		}

		return this.sortedTypes;
	}

	getNodeFields(type: string) {
		const node = this.nodesByType.get(type)[0];
		const intervals = this.getIntervalsInOrder();

		const eventFeatures = new Set<string>();
		const nodeFeatures = new Set<string>();

		for (const interval of intervals) {
			const info = node.getIntervalData(interval);

			info.eventFeatures?.keys().forEach((key) => eventFeatures.add(key));

			info.features?.keys().forEach((key) => nodeFeatures.add(key));
		}

		return {
			event: Array.from(eventFeatures.values()),
			node: Array.from(nodeFeatures.values()),
		};
	}

	// Node are sorted into a relative order.  Their levels
	// will at least match.
	getNodesInOrder(): Node[] {
		const types = this.getNodeTypes().reduce((agg, type, i) => {
			agg[type] = i;

			return agg;
		}, {});

		return Array.from(this.nodes.values()).sort(
			(nodeA: Node, nodeB: Node) => {
				const dexA = types[nodeA.type];
				const dexB = types[nodeB.type];

				if (dexA === dexB) {
					if (nodeA.ref < nodeB.ref) {
						return -1;
					}

					if (nodeB.ref > nodeA.ref) {
						return 1;
					}

					return 0;
				} else {
					return dexA - dexB;
				}
			},
		);
	}

	addEvent(event: Event) {
		const hasEvent = this.events.has(event.ref);

		if (!hasEvent) {
			this.events.set(event.ref, event);

			const list = this.eventsByInterval.get(event.interval);

			if (!this.intervals.has(event.interval.ref)) {
				this.intervals.set(event.interval.ref, event.interval);

				this.intervalTags.add(event.interval, event.interval.tags);
			}

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

	addInterval(interval: Interval) {
		this.intervals.set(interval.ref, interval);
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
		from: Interval = null,
	): Event[][] {
		const intervals = this.getIntervalsInOrder(until, from);

		return intervals.map((interval) =>
			this.eventsByInterval.get(interval),
		);
	}

	toJSON(): GraphJSON {
		return {
			nodes: this.getNodesInOrder().map((node) => node.toJSON()),
			events: this.getEventsInOrder().flatMap((interval) =>
				interval.map((event) => event.toJSON()),
			),
			intervals: this.getIntervalsInOrder(),
		};
	}
}

export function load(source: string): Graph {
	const schema = <GraphJSON>JSON.parse(source);
	const graph = new Graph();

	for (const interval of schema.intervals) {
		graph.addInterval(
			new Interval(interval.ref, interval.label, interval.tags),
		);
	}

	for (const eventJSON of schema.events) {
		const interval = graph.getInterval(eventJSON.intervalRef);
		const event = new Event(eventJSON.ref, interval);

		event.features.load(eventJSON.features);

		graph.addEvent(event);
	}

	for (const nodeJSON of schema.nodes) {
		const node = new Node(nodeJSON.ref, nodeJSON.type, {
			tags: nodeJSON.tags,
		});

		nodeJSON.intervals.map((intervalInfo) => {
			const interval = graph.getInterval(intervalInfo.intervalRef);

			if (intervalInfo.eventRef) {
				const event = <Event>graph.getEvent(intervalInfo.eventRef);

				node.addEvent(event, intervalInfo.event);
			}

			if (intervalInfo.parentRef) {
				const parent = graph.getNode(intervalInfo.parentRef);
				if (!parent) {
					console.log(
						`failing to connect: ${node.ref} to ${intervalInfo.parentRef}`,
					);
				}

				node.setParent(interval, parent);
			}

			if (intervalInfo.features) {
				node.getFeatures(interval).load(intervalInfo.features);
			}
		});

		graph.addNode(node);
	}

	return graph;
}

export function dump(graph: Graph): string {
	return JSON.stringify(graph, null, '\t');
}
