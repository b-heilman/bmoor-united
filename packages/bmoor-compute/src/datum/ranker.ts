import {FeatureReference} from '../datum.interface';
import {DatumProcessor} from './processor';
import {
	DatumProcessorFunction,
	DatumProcessorRequirement,
} from './processor.interface';
import {DatumRankerSettings} from './ranker.interface';

export class DatumRanker<NodeSelector, IntervalRef> extends DatumProcessor<
	NodeSelector,
	IntervalRef
> {
	settings: DatumRankerSettings<NodeSelector>; // run this against the datum to select what else it's compared to

	constructor(
		name: FeatureReference,
		settings: DatumRankerSettings<NodeSelector>,
		fn: DatumProcessorFunction,
		reqs: DatumProcessorRequirement<NodeSelector, IntervalRef>[],
	) {
		super(name, fn, reqs);

		this.settings = settings;
	}
}
