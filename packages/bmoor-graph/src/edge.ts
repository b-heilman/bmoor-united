import { EdgeJSON } from './edge.iterface';
import {NodeInterface} from './node.interface';
import {Weighted} from './weighted';

export class Edge extends Weighted {
	node: NodeInterface;

	constructor(node: NodeInterface) {
		super();

		this.node = node;
	}

	toJSON(): EdgeJSON {
		return {
			node: this.node.ref,
			weights: this.weights
		};
	}
}
