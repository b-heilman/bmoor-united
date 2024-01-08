import {EventReference} from '../event.interface';
import {Features} from '../features';
import {Graph} from '../graph';
import {NodeReference} from '../node.interface';

function searchGraphs(
	graphs: Graph[],
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

export class GraphView {
	graphs: Graph[];
	connections: Map<
		NodeReference,
		Map<NodeReference, Map<EventReference, Features>>
	>;
	events: Map<EventReference, number>;

	constructor() {
		this.graphs = [];
	}

	addGraph(graph: Graph) {
		this.graphs.push(graph);
	}

	getConnected(root: NodeReference, depth = 3): NodeReference[] {
		const visited = new Set<NodeReference>();

		searchGraphs(this.graphs, root, visited, depth);

		return Array.from(visited.values());
	}

	render(root: NodeReference | NodeReference[]) {
		this.connections = new Map();

		if (!(root instanceof Array)) {
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

				for (const event of events) {
					const features = event.getNodeFeatures(nodeRef);

					for (const info of event.nodeInfo.values()) {
						const otherNode = info.node;

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
		depth=4,
		path: NodeReference[] = [],
		visited = null
	): NodeReference[][] {
		let paths = [];

		if (!visited){
			visited = new Set<NodeReference>();
		}
		
		visited.add(from);
		path.push(from);

		depth--;
		if (from === to) {
			// If we reached the destination, return the current path
			paths = [path.slice()];
		} else if (depth > -1) {
			const connections = this.connections.get(from);
			for (const [otherRef] of connections.entries()) {
				if (!visited.has(otherRef)) {
					const extendedPaths = this.getAllPaths(
						otherRef,
						to,
						depth,
						path,
						visited
					);
					paths = paths.concat(extendedPaths);
				}
			}
		}

		visited.delete(from);
		path.pop();

		return paths;
	}

	/*
	sumEdges(from: Node, to: Node, fn: (from: Features, to: Features) => number){
		const search = [from];
		const state = {events:{}, values:{[to.ref] : 0}};
		
		while(search.length){
			const cur = search.shift();

			const eventMap = this.connections.get(cur.ref);

			for (const [eventRef, connectionMap] of eventMap.entries()) {
				for (const [otherRef, featureData] of connectionMap.entries()) {
					const otherDex = getDex(otherRef);

					rtn[nodeDex][otherDex] += fn(connectionMap.get(otherRef));
				}
			}
		}
	}
	*/

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
