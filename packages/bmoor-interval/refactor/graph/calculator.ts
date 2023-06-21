import {Node} from '../../src/node';
import {Weights} from '../../src/weights';
import {GraphSelection} from './selection';

export class GraphCalculator {
	selection: GraphSelection;

	constructor(selection: GraphSelection = null) {
		this.setSelection(selection);
	}

	setSelection(selection: GraphSelection) {
		this.selection = selection;

		return this;
	}

	copyToNode(from: string, to?: string) {
		this.selection.transfer(from, to);

		return this;
	}

	/**
	 * For every node in the selection, go through each interval and sum them up
	 * over time
	 */
	intervalSum(from: string, to: string = null, clean = false) {
		if (!to) {
			to = from;
		}

		this.selection.eachInterval(
			(nodeWeights, edgeWeights, prevWeights) => {
				if (!nodeWeights.has(to) || clean) {
					if (prevWeights) {
						nodeWeights.set(
							to,
							prevWeights.get(to) + edgeWeights.get(from),
						);
					} else {
						nodeWeights.set(to, edgeWeights.get(from));
					}
				}
			},
		);

		return this;
	}

	bubbleSum(mount: string) {
		const interval = this.selection.settings.interval;

		this.selection.nodes.forEach((node: Node) =>
			node.pull(
				interval,
				(parentWeights: Weights, selfWeights: Weights) => {
					parentWeights.sum(mount, selfWeights.get(mount));
				},
				{
					continue: (selfNode) =>
						!(<Node>selfNode).hasWeight(interval, mount),
				},
			),
		);

		return this;
	}
}
