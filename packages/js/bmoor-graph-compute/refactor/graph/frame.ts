//import {pearsonCorrelation} from '@bmoor/stats';
//import {Features} from '../features';
//import {Node} from '../node';
import {prettyArray} from '@bmoor/string';

import {Graph} from '../../src/graph';
import {Interval} from '../../src/interval';

class GraphFrameData {
	features: string[];
	rows: number[][];

	constructor(features: string[], rows: number[][]) {
		this.features = features;
		this.rows = rows;
	}

	toString() {
		return prettyArray(this.rows, {
			separator: ' | ',
			columns: this.features.reduce((agg, feature) => {
				agg[feature] = {
					// TODO: make this more dynamic?
					align: 'right',
					precision: 2,
					length: 8,
				};

				return agg;
			}, {}),
		});
	}
}

export class GraphFrame {
	graph: Graph;

	constructor(graph: Graph) {
		this.graph = graph;
	}

	getNodeFeatures(interval: Interval, type: string) {
		const fields = new Set<string>();
		const nodes = this.graph.nodesByType.get(type);

		// TODO: is there a way to track fields live
		for (const node of nodes) {
			const info = node.getIntervalData(interval);

			info.features?.keys().forEach((key) => fields.add(key));
		}

		const features = Array.from(fields.values());

		return new GraphFrameData(
			features,
			nodes.map((node) => {
				const info = node.getIntervalData(interval);

				return features.map((feature) => info.features?.get(feature));
			}),
		);
	}

	getEventFeatures(interval: Interval, type: string) {
		const fields = new Set<string>();
		const nodes = this.graph.nodesByType.get(type);

		// TODO: is there a way to track fields live
		for (const node of nodes) {
			const info = node.getIntervalData(interval);

			info.eventFeatures?.keys().forEach((key) => fields.add(key));
		}

		const features = Array.from(fields.values());

		return new GraphFrameData(
			features,
			nodes.map((node) => {
				const info = node.getIntervalData(interval);

				return features.map((feature) => info.eventFeatures.get(feature));
			}),
		);
	}

	/*
	compute(
		compute: (
			nodeA: Node,
			nodeB: Node,
			eventA: Event,
			eventB: Event
		) => Features,
		settings: {
			labeler?: (eventA: Event, eventB: Event) => Features;
			// TODO: Node.type
		} = {}
	) {
		this.columns = null;

		this.computed = Object.values(this.graph.events).flatMap((events) => {
			return Array.from(events).flatMap((eventInfo) => {
				// TODO: not sure I want to return back an object or an array
				const features: Features[] = eventInfo[1].computeDataFrame(
					compute,
					settings
				);

				return features.map((weight) => {
					if (!this.columns) {
						this.columns = Object.keys(weight);
					}

					const rtn = [];

					this.columns.forEach((key) => {
						rtn.push(weight[key]);
					});

					return rtn;
				});
			});
		});
	}

	checkCorrelation(col1: string, col2: string) {
		const pos1 = this.columns.indexOf(col1);
		const pos2 = this.columns.indexOf(col2);

		return pearsonCorrelation(
			this.computed.map((row) => row[pos1]),
			this.computed.map((row) => row[pos2])
		);
	}

	getColumnCombinations(columns: string[] = null) {
		if (columns) {
			// eh?, sanitize?
		} else {
			columns = this.columns.slice(0);
		}

		const rtn = [];
		while (columns.length) {
			const left = columns.shift();

			for (const right of columns) {
				rtn.push([left, right]);
			}
		}

		return rtn;
	}

	toJSON() {
		return {
			columns: this.columns,
			values: this.computed
		};
	}
	*/
}
