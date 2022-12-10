import {Weights} from './weighted.interface';

export interface NodeJSON {
	ref: string;
	weights: Weights;
}

export interface NodeInterface extends NodeJSON {
	ref: string;
	weights: Weights;
}
