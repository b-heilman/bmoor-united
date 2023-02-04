import {EdgeInterface, EdgeJson} from './edge.iterface';
import {NodeInterface} from './node.interface';
import {Weights} from './weights';

export class Edge implements EdgeInterface {
	node: NodeInterface;
	weights: Weights;

	constructor(node: NodeInterface) {
		this.node = node;
		this.weights = new Weights();
	}

	toJSON(): EdgeJson {
		return {
			node: this.node.ref,
			weights: this.weights.data
		};
	}
}
