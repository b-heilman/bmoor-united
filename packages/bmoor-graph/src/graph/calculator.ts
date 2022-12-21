import { Edge } from "../edge";
import { Event } from "../event";
import { Graph } from "../graph";
import { Interval } from "../interval.interface";
import {Node} from '../node';

class ListCalculator {
	array: Array<Node>;
	
	constructor(arr: Array<Node>) {
		this.array = arr;
	}

	bucket(interval: Interval, mount: string, bucketCount: number) {
		const arr = this.array;

		if (arr.length) {
			const limit = Math.floor(arr.length / bucketCount);

			arr[0].setWeight(interval, mount, bucketCount);
			for (let i = 1, c = arr.length; i < c; i++) {
				if (i % limit === 0) {
					bucketCount--;
				}

				arr[i].setWeight(interval, mount, bucketCount);
			}
		}
	}

	extremes(){
		const min = this.array[0];
		const max = this.array[this.array.length-1];

		return {
			min,
			max
		};
	}
}

class GraphCalculator {
    graph: Graph;

    constructor(graph: Graph){
        this.graph = graph;
    }

	/*
    weight(
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
		return this.weight(
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

    sort(
		mount: string,
		sorter: string | ((nodeA: Node, nodeB: Node) => number)
	): ListCalculator {
		if (typeof sorter === 'string') {
			const field = sorter;
			sorter = (nodeA, nodeB) => {
				return nodeB.getWeight(field) - nodeA.getWeight(field);
			};
		}

		const sorted = Array.from(this.graph.nodes.values()).sort(sorter);

		sorted.forEach((node, i, arr) => {
			node.weights[mount] = arr.length - i;
		});

		return new ListCalculator(sorted);
	}
	*/
 }