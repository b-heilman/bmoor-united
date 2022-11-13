export class Node {
	ref: string;
	weight: number;

	constructor(ref: string) {
		this.ref = ref;
		this.weight = 0;
	}
}

export class Edge {
	from: Node;
	to: Node;
	directed: boolean;

	weights?: Record<string, number>;
	metadata?: Record<string, string>;

	constructor(from: Node, to: Node, directed: boolean) {
		this.from = from;
		this.to = to;
		this.directed = directed;
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

	addEdge(fromRef: string, toRef: string, directed: boolean): Edge {
		const from = this.getNode(fromRef);
		const to = this.getNode(toRef);

		let map = this.map.get(from);
		let rtn = map?.get(to);

		if (!rtn) {
			from.weight++;

			if (!map) {
				map = new Map();

				this.map.set(from, map);
			}

			rtn = new Edge(from, to, directed);

			map.set(to, rtn);

			if (!directed) {
				to.weight++;

				map = this.map.get(to);

				if (!map) {
					map = new Map();

					this.map.set(to, map);
				}

				// if it already exists, I'm dropping it.  Is that a problem?
				map.set(from, rtn);
			}
		}

		return rtn;
	}

	has(fromRef: string, toRef: string) {
		const from = this.getNode(fromRef);
		const to = this.getNode(toRef);

		return !!this.map.get(from)?.get(to);
	}

	sort(
		sortFn: (e: Edge, b: Node, a: Node) => number,
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
						} else if (edge.directed === false) {
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
						} else if (edge.directed === false) {
							return sortFn(edge, nodeA, nodeB) * -1;
						}
					}

					return sortFn(null, nodeB, nodeA);
				}
			})
			.map((dex) => this.index[dex]);
	}
}
