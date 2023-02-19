import {EventJson} from './event.interface';
import {IntervalJSON} from './interval.interface';
import {NodeJson} from './node.interface';

export interface GraphJSON {
	nodes: NodeJson[];
	events: EventJson[];
	intervals: IntervalJSON[];
}
