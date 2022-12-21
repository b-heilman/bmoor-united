import { Interval } from "./interval.interface";
import { Weights } from "./weights"

export type IntervaledWeights = Map<Interval, Weights> 

export interface WeightedInterface {
    intervals: IntervaledWeights
}
