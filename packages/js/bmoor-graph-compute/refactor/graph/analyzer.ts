import {Graph} from '../../src/graph';

export class GraphCalculator {
	graph: Graph;

	constructor(graph: Graph) {
		this.graph = graph;
	}

	/*
	getFeatures(full = false): {
		node: string[];
		event: string[];
		event: string[];
	} {
		let nodeFeatures = null;
		let eventFeatures = null;
		let eventFeatures = null;

		if (full) {
			nodeFeatures = new Set();
			eventFeatures = new Set();
			eventFeatures = new Set();

			Object.values(this.nodes).forEach((node) => {
				node.getFeaures().forEach((feature) => nodeFeatures.add(feature));

				Object.values(node.events).forEach((event) => {
					event
						.getFeaures()
						.forEach((feature) => eventFeatures.add(feature));

					const event = event.getEvent(node);
					event
						.getFeaures()
						.forEach((feature) => nodeFeatures.add(feature));
				});
			});
		} else {
			const node = Object.values(this.nodes)[0];
			nodeFeatures = new Set(node.getFeaures());

			const event = node.events.values().next().value[0];
			eventFeatures = new Set(event.getFeaures());

			const event = event.events.values().next().value;
			eventFeatures = new Set(event.getFeaures());
		}

		return {
			node: Array.from(nodeFeatures),
			event: Array.from(eventFeatures),
			event: Array.from(eventFeatures)
		};
	}
	*/
}
