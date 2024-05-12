import {FeatureValue} from '../datum.interface';
import {DatumProcessorFunction} from './range.interface';

export type DatumRankerFunction<DatumShape> = DatumProcessorFunction<{rank: unknown}>;

export type DatumRankerStats = Record<string, FeatureValue>;

export type DatumRankerSettings<NodeSelector> = {
	select: NodeSelector; // run this against the datum to select what else it's compared to
	asc?: boolean;
	bucketsCount?: number; // how many buckets to have
	bucketSize?: number; // how big a bucket can be
	filter?: {
		stats?: (all: FeatureValue[]) => DatumRankerStats;
		fn: (value: FeatureValue, stats: DatumRankerStats) => boolean;
		droppedValue: FeatureValue;
	};
};
