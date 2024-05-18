import {IDatum} from '../datum.interface';
import {DatumAcrossContext, DatumAcrossSettings} from './across.interface';

export interface DatumRankerContext<SelectT, DatumT extends IDatum>
	extends DatumAcrossContext<SelectT, DatumT> {}

export interface DatumRankerSettings<SelectT>
	extends DatumAcrossSettings<SelectT> {
	asc?: boolean;
	bucketsCount?: number; // how many buckets to have
	bucketSize?: number; // how big a bucket can be
}

/**
TODO: maintain support

export type DatumRankerSettings<NodeSelector> = {
	select: NodeSelector; // run this against the datum to select what else it's compared to
	filter?: {
		stats?: (all: FeatureValue[]) => DatumRankerStats;
		fn: (value: FeatureValue, stats: DatumRankerStats) => boolean;
		droppedValue: FeatureValue;
	};
};
**/
