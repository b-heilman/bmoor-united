import { EventReference } from "../event.interface";
import { NodeInterface, NodeReference } from "../node.interface";
import { Graph } from "../graph";
import { Node } from "../node";
import { Features } from "../features";

export class GraphView {
	nodes: NodeInterface[];
	connections: Map<
		NodeReference,
		Map<EventReference, Map<NodeReference, Features>>
	>;

	constructor(root: Node | Node[]) {
		this.nodes = [];
		this.connections = new Map();

		if (root instanceof Node) {
			root = [root];
		}

		for (const node of root) {
			this.addNode(node);
		}
	}

	addNode(node: NodeInterface) {
		if (!this.connections.has(node.ref)) {
			this.connections.set(node.ref, new Map());
			this.nodes.push(node);
		}
	}

	addGraph(graph: Graph) {
		// We need to digure out all connections, I will be greedy to generate a directed graph
		// using multiple graphs.
		// - iterate only through known nodes, so breadth first search
		// - keep appending for each graph.  This allows us to add the same graph multiple times
		//   and or multiple to show connections over time
		for (const node of this.nodes.slice(0)) {
			// I add below, so create copy to iterate through
			const events = graph.getEvents(node.ref);
			const connections = this.connections.get(node.ref);

			for (const event of events) {
				const features = event.getNodeFeatures(node.ref);

				if (!connections.has(event.ref)) {
					const eventConnections = new Map<NodeReference, Features>();

					connections.set(event.ref, eventConnections);

					for (const info of event.nodeInfo.values()) {
						const otherNode = info.node;

						if (otherNode !== node) {
							eventConnections.set(otherNode.ref, features);
						}

						this.addNode(otherNode);
					}
				}
			}
		}
	}
}
