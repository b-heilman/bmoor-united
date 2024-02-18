import {EventJSON} from '../src/interval/graph.interface';
import {IntervalJSON} from '../../bmoor-interval/src/interval.interface';
import {NodeJSON} from '../src/node.interface';

export interface GraphJSON {
	nodes: NodeJSON[];
	events: EventJSON[];
	intervals: IntervalJSON[];
}
