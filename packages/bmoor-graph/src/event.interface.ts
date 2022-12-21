import {WeightedInterface, Weights} from './weighted.interface';
import {EdgeJSON} from './edge.iterface';
import { Interval } from './interval.interface';

export interface EventJSON extends WeightedInterface {
	ref: string;
	edges: EdgeJSON[];
}

export interface EventOrder extends Interval {
}

export type EventReference = string;