import {FeatureReference} from '../datum.interface';
import {DatumProcessor} from './processor';
import {DatumProcessorRequirement} from './range.interface';
import {
	DatumRankerFunction,
	DatumRankerSettings,
} from './ranker.interface';

// extend accessor but compute for a range of values based on settings
export class DatumRanker<NodeSelector, IntervalRef, DatumIndex> extends DatumProcessor<
	NodeSelector,
	IntervalRef,
	{
		rank: DatumProcessorRequirement<
			NodeSelector,
			IntervalRef
		>;
	}
> {
	settings: DatumRankerSettings<NodeSelector>; // run this against the datum to select what else it's compared to

	constructor(
		name: FeatureReference,
		settings: DatumRankerSettings<NodeSelector>,
		fn: DatumRankerFunction<DatumIndex>,
		reqs: {
			rank: DatumProcessorRequirement<
				NodeSelector,
				IntervalRef
			>;
		}
	) {
		super(name, fn, reqs);

		this.settings = settings;
	}
}
