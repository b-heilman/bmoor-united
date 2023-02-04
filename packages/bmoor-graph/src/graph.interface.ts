import {NodeJson} from './node.interface';
import {EventJson} from './event.interface';

export interface GraphJSON {
	nodes: NodeJson[];
	events: EventJson[];
}
