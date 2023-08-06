import {EdgeInterface} from './edge.interface';
import {Node} from './node';

export class Edge implements EdgeInterface {
	label: string;
	target: Node;

	constructor(label: string, target: Node) {
		this.label = label;
		this.target = target;
	}
}
