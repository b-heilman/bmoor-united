import { Node } from '../node';
import { Weights } from '../weights';
import {GraphSelection} from './selection';

export class GraphCalculator {
	selection: GraphSelection;

	constructor(selection: GraphSelection) {
		this.selection = selection;
	}

	copyToNode(from: string, to?: string) {
		if (!to) {
			to = from;
		}

		this.selection.eachInterval((nodeWeights, edgeWeights) => {
			nodeWeights.set(to, edgeWeights.get(from));
		});
	}

	/**
	 * For every node in the selection, go through each interval and sum them up
	 * over time
	 */
	intervalSum(from: string, to: string = null, clean:boolean = false) {
		if (!to) {
			to = from;
		}

		this.selection.eachInterval(
			(nodeWeights, edgeWeights, prevWeights) => {
				if (!nodeWeights.has(to) || clean){
					if (prevWeights) {
						nodeWeights.set(to, prevWeights.get(to) + edgeWeights.get(from));
					} else {
						nodeWeights.set(to, edgeWeights.get(from));
					}
				}
			}
		);
	}

	bubbleSum(from: string, to?: string) {
		const interval = this.selection.settings.interval;

		if (!to) {
			to = from;
		}

		this.selection.nodes.forEach(
			(node: Node) => node.pull(
				interval, 
				(parentWeights: Weights, selfWeights: Weights) => {
					parentWeights.sum(to, selfWeights.get(from));
				},
				(selfNode => selfNode.hasWeight(interval, from))
			)
		);
	}
}
