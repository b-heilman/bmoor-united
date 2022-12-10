import {Weights} from './weighted.interface';
import {Event} from './event';
import {Edge} from './edge';
import {Node} from './node';
import {List} from './list';
import {GraphJSON} from './graph.iterface';

type NodeMap = Record<string, Node>;
type EventMap = Record<string, Event>;
type PartionMap = Record<number, EventMap>;

const DEFAULT_PARTITION = 'None';

export class Graph {
	nodes: NodeMap;
	events: PartionMap;
	weights: Weights;

	constructor() {
		this.nodes = {};
		this.events = {};
		this.weights = {};
	}

	addNode(ref: string, weights?: Weights) {
		const node = new Node(ref);

		this.nodes[ref] = node;

		if (weights) {
			node.addWeights(weights);
		}

		return this;
	}

	getNode(ref: string) {
		if (!(ref in this.nodes)) {
			this.addNode(ref);
		}

		return this.nodes[ref];
	}

	addEvent(ref: string, partition = DEFAULT_PARTITION): Event {
		const event = new Event(ref);

		let section = this.events[partition];
		if (!section) {
			section = {};
			this.events[partition] = section;
		}

		section[ref] = event;

		return event;
	}

	getEvent(ref: string, partition = DEFAULT_PARTITION): Event {
		const event = this.events[partition]?.[ref];

		if (event) {
			return event;
		} else {
			return this.addEvent(ref, partition);
		}
	}

	addWeights(weights: Weights) {
		Object.assign(this.weights, weights);
	}

	connect(
		partition: string,
		eventRef: string,
		fromRef: string,
		toRef: string
	): {event: Event; node: Node; edge: Edge} {
		const event = this.getEvent(eventRef, partition);
		const node = this.getNode(fromRef);
		const to = this.getNode(toRef);

		const edge = new Edge(node, to);

		event.addEdge(edge);

		node.addEvent(event);

		return {
			event,
			node,
			edge
		};
	}

	pair(
		partition: string,
		eventRef: string,
		fromRef: string,
		fromWeight: Weights,
		toRef: string,
		toWeight: Weights
	) {
		this.connect(partition, eventRef, fromRef, toRef).edge.addWeights(
			fromWeight
		);

		this.connect(partition, eventRef, toRef, fromRef).edge.addWeights(
			toWeight
		);
	}

	/***
	 *
	 * @param mount
	 * @param evaluator
	 * @param settings
	 * @returns
	 ***/
	calculateGraphWeight(
		mount: string,
		evaluator: (edgeA: Edge, edgeB: Edge) => number,
		settings: {
			summarizer?: (values: number[]) => number;
		} = {}
	) {
		const summarizer =
			settings.summarizer ||
			((values) => values.reduce((agg, val) => agg + val, 0));

		this.weights[mount] = summarizer(
			Object.values(this.nodes).flatMap((node: Node) =>
				node.getEvents().map((event: Event) => {
					const edgeA = event.getEdge(node);
					const edgeB = event.getOtherEdge(node);

					return evaluator(edgeA, edgeB);
				})
			)
		);

		return this;
	}

	calculateNodeWeight(
		mount: string,
		evaluator: (edgeA: Edge, edgeB: Edge) => number,
		settings: {
			summarizer?: (values: number[]) => number;
			dexs?: string[];
		} = {}
	) {
		const dexs = settings.dexs || Object.keys(this.nodes);
		const summarizer =
			settings.summarizer ||
			((values) => values.reduce((agg, val) => agg + val, 0));

		for (const dex of dexs) {
			const node = this.nodes[dex];

			const events = node.getEvents();
			node.setWeight(
				mount,
				summarizer(
					events.map((event: Event) => {
						const edgeA = event.getEdge(node);
						const edgeB = event.getOtherEdge(node);

						return evaluator(edgeA, edgeB);
					})
				)
			);
		}

		return this;
	}

	point(
		mount: string,
		pointFn: (edgeA: Edge, edgeB: Edge) => number,
		settings: {
			dexs?: string[];
		} = {}
	) {
		return this.calculateNodeWeight(
			mount,
			(edgeA, edgeB) => pointFn(edgeA, edgeB) || 0,
			settings
		);
	}
	// edges should always be used when ranking.   If not,
	// the user can always do a simple node sort
	rank(
		mount: string,
		rankFn: (edgeA: Edge, edgeB: Edge) => number,
		settings: {
			dexs?: string[];
		} = {}
	) {
		const dexs = settings.dexs || Object.keys(this.nodes);

		this.point(mount, rankFn, settings);

		const ranking = dexs
			.map((dex) => this.nodes[dex])
			.sort((nodeB, nodeA) => {
				let sum = 0;

				const events = nodeA.getEvents(nodeB);
				for (const event of events) {
					const edgeA = event.getEdge(nodeA);
					const edgeB = event.getEdge(nodeB);

					if (rankFn(edgeA, edgeB) > 0) {
						sum += 1;
					} else {
						sum -= 1;
					}
				}

				// if there's no connections or do direct diff, use the ranks
				if (sum === 0) {
					const rankA = nodeA.getWeight(mount);
					const rankB = nodeB.getWeight(mount);

					if (rankA > rankB) {
						return 1;
					} else if (rankA < rankB) {
						return -1;
					} else {
						return 0;
					}
				} else {
					return sum;
				}
			});

		ranking.forEach((node, i, arr) => {
			node.setWeight(mount, arr.length - i);
		});

		return ranking;
	}

	getFeatures(full = false): {
		node: string[];
		event: string[];
		edge: string[];
	} {
		let nodeFeatures = null;
		let eventFeatures = null;
		let edgeFeatures = null;

		if (full) {
			nodeFeatures = new Set();
			eventFeatures = new Set();
			edgeFeatures = new Set();

			Object.values(this.nodes).forEach((node) => {
				node.getFeaures().forEach((feature) => nodeFeatures.add(feature));

				Object.values(node.events).forEach((event) => {
					event
						.getFeaures()
						.forEach((feature) => edgeFeatures.add(feature));

					const edge = event.getEdge(node);
					edge
						.getFeaures()
						.forEach((feature) => nodeFeatures.add(feature));
				});
			});
		} else {
			const node = Object.values(this.nodes)[0];
			nodeFeatures = new Set(node.getFeaures());

			const event = node.events.values().next().value[0];
			eventFeatures = new Set(event.getFeaures());

			const edge = event.edges.values().next().value;
			edgeFeatures = new Set(edge.getFeaures());
		}

		return {
			node: Array.from(nodeFeatures),
			event: Array.from(eventFeatures),
			edge: Array.from(edgeFeatures)
		};
	}

	sort(
		mount: string,
		sorter: string | ((nodeA: Node, nodeB: Node) => number)
	): List {
		if (typeof sorter === 'string') {
			const field = sorter;
			sorter = (nodeA, nodeB) => {
				return nodeB.getWeight(field) - nodeA.getWeight(field);
			};
		}

		const sorted = Object.values(this.nodes).sort(sorter);

		sorted.forEach((node, i, arr) => {
			node.weights[mount] = arr.length - i;
		});

		return new List(sorted);
	}

	computeDataFrame(
		compute: (
			nodeA: Node,
			nodeB: Node,
			edgeA: Edge,
			edgeB: Edge
		) => Weights,
		settings: {
			labeler?: (edgeA, edgeB) => number;
			labelMount?: string;
		} = {}
	) {
		return Object.values(this.events).flatMap((events) => {
			return Object.values(events).flatMap((event) =>
				event.computeDataFrame(compute, settings)
			);
		});
	}

	toArray(field: string = null) {
		if (field) {
			return Object.values(this.nodes).sort((nodeA, nodeB) => {
				return nodeB.getWeight(field) - nodeA.getWeight(field);
			});
		} else {
			return Object.values(this.nodes);
		}
	}

	toJSON(): GraphJSON {
		return {
			nodes: Object.values(this.nodes).map((node) => node.toJSON()),
			events: Object.entries(this.events).reduce(
				(agg, [partition, events]) => {
					agg[partition] = Object.values(events).map((event) =>
						event.toJSON()
					);

					return agg;
				},
				{}
			)
		};
	}
}

export function load(source: string): Graph {
	const schema = <GraphJSON>JSON.parse(source);
	const graph = new Graph();

	schema.nodes.map(({ref, weights}) => {
		graph.getNode(ref).addWeights(weights);
	});

	Object.entries(schema.events).forEach(([partition, events]) => {
		events.map(({ref, weights, edges}) => {
			graph.addEvent(ref, partition).addWeights(weights);

			edges.forEach(({from, to, weights}) => {
				graph.connect(partition, ref, from, to).edge.addWeights(weights);
			});
		});
	});

	return graph;
}

export function dump(graph: Graph): string {
	return JSON.stringify(graph, null, '\t');
}
