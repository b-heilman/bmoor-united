import {NodeInterface} from './node.interface';
import {Weighted} from './weighted';

export class Edge extends Weighted {
	to: NodeInterface;
	from: NodeInterface;

	constructor(from: NodeInterface, to: NodeInterface) {
		super();

		this.to = to;
		this.from = from;
	}

	toJSON() {
		return {
			from: this.from.ref,
			to: this.to.ref,
			weights: this.weights
		};
	}
}
