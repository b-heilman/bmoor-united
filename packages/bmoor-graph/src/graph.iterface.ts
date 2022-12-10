import {NodeJSON} from './node.interface';
import {EventJSON} from './event.interface';

export interface GraphJSON {
	nodes: NodeJSON[];
	events: Record<string, EventJSON[]>;
}
