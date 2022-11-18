export interface NodeInterface {
	ref: string;
	weights?: Record<string, number>;
}

export class Edge {
	from: NodeInterface;
	to: NodeInterface;

	weights?: Record<string, number>;

	constructor(from: NodeInterface, to: NodeInterface) {
		this.from = from;
		this.to = to;
	}
}

export class Event {
	to: NodeInterface;

	weights?: Record<string, number>;

	constructor(to: NodeInterface) {
		this.to = to;
	}
}

export class Node {
	ref: string;
	events: Record<string, Event>;
	weights: Record<string, number>;

	constructor(ref: string) {
		this.ref = ref;
		this.weights = {
			connections: 0
		};
		this.events = {};
	}

	addEvent(ref: string, event: Event) {
		this.events[ref] = event;
	}
}

export class Graph {
	index: Record<string, Node>;
	map: Map<Node, Map<Node, Edge>>;

	constructor() {
		this.index = {};
		this.map = new Map();
	}

	addNode(ref: string) {
		const node = new Node(ref);

		this.index[ref] = node;

		return node;
	}

	getNode(ref: string) {
		if (ref in this.index) {
			return this.index[ref];
		} else {
			return this.addNode(ref);
		}
	}

	addEdge(fromRef: string, toRef: string): Edge {
		const from = this.getNode(fromRef);
		const to = this.getNode(toRef);

		let map = this.map.get(from);
		let rtn = map?.get(to);

		if (!rtn) {
			rtn = new Edge(from, to);

			from.weights.connections++;

			if (!map) {
				map = new Map();

				this.map.set(from, map);
			}

			map.set(to, rtn);
			//---------
			to.weights.connections++;

			map = this.map.get(to);

			if (!map) {
				map = new Map();

				this.map.set(to, map);
			}

			map.set(from, rtn);
		}

		return rtn;
	}

	addEvent(ref: string, fromRef: string, toRef: string): Event {
		const from = this.getNode(fromRef);
		const to = this.getNode(toRef);

		const event = new Event(to);

		from.addEvent(ref, event);

		return event;
	}

	has(fromRef: string, toRef: string) {
		const from = this.getNode(fromRef);
		const to = this.getNode(toRef);

		return !!this.map.get(from)?.get(to);
	}

	rank(
		mount: string,
		rankFn: (event: Event, node: NodeInterface) => number,
		dexs: string[] = null
	) {
		if (!dexs) {
			dexs = Object.keys(this.index);
		}

		const ranking = dexs.map((dex) => {
			const nodeA = this.index[dex];

			return {
				node: nodeA,
				value: Object.keys(nodeA.events).reduce((value, key) => {
					const event = nodeA.events[key];

					return value + rankFn(event, nodeA);
				}, 0)
			};
		});

		ranking.sort((a, b) => b.value - a.value);

		ranking.map(({node}, i) => {
			node.weights[mount] = i + 1;
		});

		return ranking;
	}

	sort(
		sortFn: (e: Edge, b: NodeInterface, a: NodeInterface) => number,
		dexs: string[] = null
	) {
		if (!dexs) {
			dexs = Object.keys(this.index);
		}

		const ranks = dexs.reduce((agg, dex) => {
			const nodeA = this.index[dex];
			const map = this.map.get(nodeA);

			agg.set(
				nodeA,
				dexs.reduce((sum, oDex) => {
					const nodeB = this.index[oDex];
					const edge = map.get(nodeB);

					if (edge) {
						if (edge.from === nodeA) {
							if (sortFn(edge, nodeA, nodeB) > 0) {
								return sum + 1;
							}
						} else {
							if (sortFn(edge, nodeA, nodeB) < 0) {
								return sum + 1;
							}
						}
					}

					return sum;
				}, 0)
			);

			return agg;
		}, new Map());

		return dexs
			.sort((b, a) => {
				const nodeA = this.getNode(a);
				const nodeB = this.getNode(b);
				const rankA = ranks.get(nodeA);
				const rankB = ranks.get(nodeB);

				if (rankA > rankB) {
					return 1;
				} else if (rankB > rankA) {
					return -1;
				} else {
					const edge = this.map.get(nodeA)?.get(nodeB);

					if (edge) {
						if (edge.from === nodeA) {
							return sortFn(edge, nodeA, nodeB);
						} else {
							return sortFn(edge, nodeA, nodeB) * -1;
						}
					}

					return sortFn(null, nodeB, nodeA);
				}
			})
			.map((dex) => this.index[dex]);
	}
}
