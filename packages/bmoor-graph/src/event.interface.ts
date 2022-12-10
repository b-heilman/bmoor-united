import {Weights} from './weighted.interface';
import {EdgeJSON} from './edge.iterface';

export interface EventJSON {
	ref: string;
	weights: Weights;
	edges: EdgeJSON[];
}
