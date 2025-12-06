import type {EventReference} from '../event.interface.ts';
import {Features} from '../features.ts';
import type {GraphSelector} from '../graph.interface.ts';
import {Graph} from '../graph.ts';
import type {NodeReference} from '../node.interface.ts';
import {GraphDatum} from './datum.ts';
import type {NodePath} from './view.interface.ts';

function searchGraphs<
	DatumT extends GraphDatum<GraphSelector>,
	SelectorT extends GraphSelector,
>(
	graphs: Graph<DatumT, SelectorT>[],
	nodeRef: NodeReference,
	visited: Set<NodeReference>,
	depth: number,
) {
	depth--;

	visited.add(nodeRef);

	if (depth > -1) {
		for (const graph of graphs) {
			const events = graph.getEvents(nodeRef);

			for (const event of events) {
				for (const info of event.nodeInfo.values()) {
					const otherRef = info.node.ref;

					if (!visited.has(otherRef)) {
						searchGraphs(graphs, otherRef, visited, depth);
					}
				}
			}
		}
	}
}

export class GraphView<
	DatumT extends GraphDatum<GraphSelector>,
	SelectorT extends GraphSelector,
> {
	graphs: Graph<DatumT, SelectorT>[];
	connections: Map<
		NodeReference,
		Map<NodeReference, Map<EventReference, Features>>
	>;
	events: Map<EventReference, number>;

	constructor() {
		this.graphs = [];
	}

	addGraph(graph: Graph<DatumT, SelectorT>) {
		this.graphs.push(graph);
	}

	getConnected(root: NodeReference, depth = 3): NodeReference[] {
		const visited = new Set<NodeReference>();

		searchGraphs(this.graphs, root, visited, depth);

		return Array.from(visited.values());
	}

	render(
		settings: {root?: NodeReference | NodeReference[]; type?: string} = {},
	) {
		let root = settings.root;

		this.connections = new Map();

		if (!root) {
			const set = new Set(this.graphs[0].nodeDex.keys());
			for (const item in this.graphs[1].nodeDex.keys()) {
				set.add(item);
			}

			root = Array.from(set);
		} else if (!(root instanceof Array)) {
			root = [root];
		}

		for (const nodeRef of root) {
			this.connections.set(nodeRef, new Map());
		}

		for (const graph of this.graphs) {
			const nodeRefs = Array.from(this.connections.keys());
			for (let i = 0; i < nodeRefs.length; i++) {
				const nodeRef = nodeRefs[i];
				// I add below, so create copy to iterate through
				const events = graph.getEvents(nodeRef);
				const connections = this.connections.get(nodeRef);

				if (!events) {
					continue;
				}

				for (const event of events) {
					const features = event.getNodeFeatures(nodeRef);

					for (const info of event.nodeInfo.values()) {
						const otherNode = info.node;

						if (settings.type && settings.type !== otherNode.type) {
							continue;
						}

						if (otherNode.ref !== nodeRef) {
							let connection = connections.get(otherNode.ref);

							if (!connection) {
								connection = new Map<EventReference, Features>();
								connections.set(otherNode.ref, connection);
							}

							connection.set(event.ref, features);

							if (!this.connections.has(otherNode.ref)) {
								this.connections.set(otherNode.ref, new Map());
								nodeRefs.push(otherNode.ref);
							}
						}
					}
				}
			}
		}
	}

	getAllPaths(
		from: NodeReference,
		to: NodeReference,
		depth = 4,
	): NodePath[] {
		const rtn = [];
		const queue = [
			{
				ref: from,
				path: new Set([from]),
			},
		];

		while (queue.length > 0) {
			const {ref, path} = queue.shift();

			if (ref === to) {
				rtn.push(Array.from(path));
			} else if (path.size < depth) {
				const connections = this.connections.get(ref);
				for (const [nextRef] of connections.entries()) {
					if (!path.has(nextRef)) {
						const newPath = new Set(path);
						newPath.add(nextRef);

						queue.push({
							ref: nextRef,
							path: newPath,
						});
					}
				}
			}
		}

		return rtn;
	}

	sumEdges(
		paths: NodePath[],
		fn: (from: Features, to: Features) => number,
	): number[] {
		return paths.map((path) => {
			let sum = 0;
			let prevRef = path[0];
			let prev = this.connections.get(path[0]);

			for (let i = 1; i < path.length; i++) {
				const curRef = path[i];
				const cur = this.connections.get(curRef);

				const prevEvent = prev.get(curRef);
				const curEvent = cur.get(prevRef);

				sum += Array.from(prevEvent.entries()).reduce(
					(agg, [eventRef, prevFeatures]) => {
						return agg + fn(prevFeatures, curEvent.get(eventRef));
					},
					0,
				);

				prev = cur;
				prevRef = curRef;
			}

			return sum;
		});
	}

	// This is the matrix view of the graph, direction in both ways
	toMatrix(fn: (features: Features[]) => number): number[][] {
		const rtn = [];
		const lookup = {};

		function getDex(ref: string) {
			let nodeDex = null;
			if (ref in lookup) {
				nodeDex = lookup[ref];
			} else {
				const newRow = Array.from({length: rtn.length}, () => 0);

				nodeDex = rtn.length;
				lookup[ref] = nodeDex;

				rtn.push(newRow);

				for (const row of rtn) {
					row.push(0);
				}
			}

			return nodeDex;
		}

		for (const [nodeRef, connectionMap] of this.connections.entries()) {
			const nodeDex = getDex(nodeRef);

			for (const [otherRef, eventMap] of connectionMap.entries()) {
				const otherDex = getDex(otherRef);

				rtn[nodeDex][otherDex] += fn(Array.from(eventMap.values()));
			}
		}

		return rtn;
	}

	// This represents a directed graph
	toJSON() {
		const rtn = {};

		for (const [nodeRef, connectionMap] of this.connections.entries()) {
			const others = {};

			for (const [otherRef, eventMap] of connectionMap.entries()) {
				const events = {};

				for (const [eventRef, featureData] of eventMap.entries()) {
					events[eventRef] = featureData.toJSON();
				}

				others[otherRef] = events;
			}

			rtn[nodeRef] = others;
		}

		return rtn;
	}
}
