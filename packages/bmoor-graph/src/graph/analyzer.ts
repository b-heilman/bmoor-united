import {Graph} from '../graph';

export class GraphCalculator {
	graph: Graph;

	constructor(graph: Graph) {
		this.graph = graph;
	}

	/*
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
	*/
}
