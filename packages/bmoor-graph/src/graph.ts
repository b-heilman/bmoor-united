import {Weights} from './weights.interface';
import {Event} from './event';
import {Edge} from './edge';
import {Node} from './node';
import {List} from './list';
import {Connector} from './connector';

export class Graph {
	nodes: Record<string, Node>;
	events: Record<string, Event>;
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

	addEvent(ref: string): Event {
		const event = new Event(ref);

		this.events[ref] = event;

		return event;
	}

	getEvent(ref: string): Event {
		const event = this.events[ref];

		if (event) {
			return event;
		} else {
			return this.addEvent(ref);
		}
	}

	addWeights(weights: Weights) {
		Object.assign(this.weights, weights);
	}

	connect(eventRef: string, fromRef: string, toRef: string): Connector {
		const event = this.getEvent(eventRef);
		const from = this.getNode(fromRef);
		const to = this.getNode(toRef);
		const edgeF = new Edge(from, to, event);
		const edgeT = new Edge(to, from, event);

		from.addEdge(edgeF);
		to.addEdge(edgeT);

		return new Connector({
			[fromRef]: edgeF,
			[toRef]: edgeT
		});
	}

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
				Object.values(node.byEvent).map((edgeA: Edge) => {
					const edgeB = (<Node>edgeA.to).getEdge(edgeA.event);

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
			const nodeA = this.nodes[dex];

			nodeA.setWeight(
				mount,
				summarizer(
					Object.values(nodeA.byEvent).map((edgeA: Edge) => {
						const edgeB = (<Node>edgeA.to).getEdge(edgeA.event);

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
				const rankA = nodeA.getWeight(mount);
				const rankB = nodeB.getWeight(mount);

				const edges = nodeA.getEdges(nodeB);

				let sum = 0;
				if (edges.length) {
					for (const edgeA of edges) {
						const edgeB = (<Node>edgeA.to).getEdge(edgeA.event);

						if (rankFn(edgeA, edgeB) > 0) {
							sum += 1;
						} else {
							sum -= 1;
						}
					}
				}

				// if there's no connections or do direct diff, use the ranks
				if (sum === 0) {
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
		compute: (edgeA: Edge, edgeB: Edge) => Weights,
		settings: {
			labeler?: (edgeA, edgeB) => number;
			labelMount?: string;
		} = {}
	) {
		return Object.values(this.nodes).flatMap((nodeA: Node) => {
			return Object.values(nodeA.byEvent).map((edgeA: Edge) => {
				// TODO: edges should have from
				const edgeB = (<Node>edgeA.to).getEdge(edgeA.event);

				const weights = compute(edgeA, edgeB);

				if (settings.labeler) {
					weights[weights?.labelMount || 'label'] = settings.labeler(
						edgeA,
						edgeB
					);
				}

				return weights;
			});
		});
	}

	toArray(field: string = null) {
		if (field){
			return Object.values(this.nodes)
				.sort((nodeA, nodeB) => {
					return nodeB.getWeight(field) - nodeA.getWeight(field);
				})
		} else {
			return Object.values(this.nodes);
		}
	}

	toJSON() {
		return {
			events: Object.values(this.events).map((event) => event.toJSON()),
			nodes: Object.values(this.nodes).map((node) => node.toJSON())
		};
	}
}

export function load(source: string): Graph {
	const schema = JSON.parse(source);
	const graph = new Graph();

	schema.events.map(({ref, weights}) => {
		graph.addEvent(ref).addWeights(weights);
	});

	schema.nodes.map(({ref, weights, edges}) => {
		const node = graph.getNode(ref).addWeights(weights);

		edges.map(({to, event, weights}) => {
			const edge = new Edge(
				node,
				graph.getNode(to),
				graph.getEvent(event)
			);

			edge.addWeights(weights);

			node.addEdge(edge);
		});
	});

	return graph;
}

export function dump(graph: Graph): string {
	return JSON.stringify(graph, null, '\t');
}
