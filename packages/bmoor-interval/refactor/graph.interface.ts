import {EventJson} from '../src/interval/graph.interface';
import {IntervalJSON} from '../../bmoor-interval/src/interval.interface';
import {NodeJson} from '../src/node.interface';

export interface GraphJSON {
	nodes: NodeJson[];
	events: EventJson[];
	intervals: IntervalJSON[];
}
