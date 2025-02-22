import {DatumInterface} from '../datum.interface';
import {DatumAcrossContext} from './across.interface';
import {DatumOffsetSettings} from './offset.interface';

export interface DatumRankerContext<DatumT extends DatumInterface, SelectT>
	extends DatumAcrossContext<DatumT, SelectT> {
	metadata?: boolean;
}

export interface DatumRankerSettings<RequirementT, SelectT>
	extends DatumOffsetSettings<SelectT> {
	asc?: boolean;
	bucketsCount?: number; // how many buckets to have
	bucketSize?: number; // how big a bucket can be
	reducer: (args: RequirementT) => number;
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
