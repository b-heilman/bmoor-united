import {Interval} from '../../../bmoor-interval/src/interval.interface';
import {NodeTag, NodeType} from '../../src/node.interface';
import {Weights} from '../../src/weights';

export type GraphSelectionComparator = (
	nodeA: Weights,
	nodeB: Weights,
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
