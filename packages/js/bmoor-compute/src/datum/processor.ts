import {FeatureReference, FeatureValue} from '../datum.interface';
import {
	DatumProcessorFunction,
	DatumProcessorInterface,
	DatumProcessorRequirement,
} from './processor.interface';

export class DatumProcessor<
	NodeSelector,
	IntervalRef,
	RequirementIndex = unknown,
> implements
		DatumProcessorInterface<NodeSelector, IntervalRef, RequirementIndex>
{
	fn: DatumProcessorFunction<RequirementIndex>;
	name: FeatureReference;
	requirements: {
		[Property in keyof RequirementIndex]: DatumProcessorRequirement<
			NodeSelector,
			IntervalRef
		>;
	};

	constructor(
		name: FeatureReference,
		fn: DatumProcessorFunction<RequirementIndex>,
		reqs: {
			[Property in keyof RequirementIndex]: DatumProcessorRequirement<
				NodeSelector,
				IntervalRef
			>;
		},
	) {
		this.fn = fn;
		this.name = name;
		this.requirements = reqs;
	}

	getRequirements(): {
		[Property in keyof RequirementIndex]: DatumProcessorRequirement<
			NodeSelector,
			IntervalRef
		>;
	} {
		return this.requirements;
	}

	process(args: RequirementIndex): FeatureValue {
		return this.fn(args);
	}
}
