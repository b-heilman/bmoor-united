import {Interval} from '../interval.interface';
import {NodeType, NodeTag} from '../node.interface';
import {Weights} from '../weights';

export type GraphSelectionComparator = (
	nodeA: Weights,
	nodeB: Weights
) => number;

interface BaseSelection {
	tag?: NodeTag;
	from?: Interval;
	sort?: GraphSelectionComparator;
	top?: number;
	bottom?: number;
}

export interface GraphSelectionSettings extends BaseSelection {
	interval: Interval;
	type: NodeType;
}

export interface GraphSelectionSubSettings extends BaseSelection {
	interval?: Interval;
}
