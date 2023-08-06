import {Node} from '../../src/node';
import {Features} from '../../src/features';
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
			(nodeFeatures, eventFeatures, prevFeatures) => {
				if (!nodeFeatures.has(to) || clean) {
					if (prevFeatures) {
						nodeFeatures.set(
							to,
							prevFeatures.get(to) + eventFeatures.get(from),
						);
					} else {
						nodeFeatures.set(to, eventFeatures.get(from));
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
				(parentFeatures: Features, selfFeatures: Features) => {
					parentFeatures.sum(mount, selfFeatures.get(mount));
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
