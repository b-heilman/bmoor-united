import {Weights} from './weighted.interface';

export interface EdgeJSON {
	from: string;
	to: string;
	weights: Weights;
}
