import {Interval} from '../../../bmoor-interval/src/interval.interface';
import {NodeTag, NodeType} from '../../src/node.interface';
import {Features} from '../../../../skunk_works/nfl_analysis/src/features';

export type GraphSelectionComparator = (
	nodeA: Features,
	nodeB: Features,
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
