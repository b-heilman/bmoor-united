import {FeatureReference, FeatureValue} from '../datum.interface';
import {
	DatumProcessorFunction,
	DatumProcessorInterface,
	DatumProcessorRequirement,
	DatumProcessorRequirementsResponse,
} from './processor.interface';

export class DatumProcessor<NodeSelector, IntervalRef>
	implements DatumProcessorInterface<NodeSelector, IntervalRef>
{
	fn: DatumProcessorFunction;
	name: FeatureReference;
	requirements: DatumProcessorRequirement<NodeSelector, IntervalRef>[];

	constructor(
		name: FeatureReference,
		fn: DatumProcessorFunction,
		reqs: DatumProcessorRequirement<NodeSelector, IntervalRef>[],
	) {
		this.fn = fn;
		this.name = name;
		this.requirements = reqs;
	}

	getRequirements(): DatumProcessorRequirement<
		NodeSelector,
		IntervalRef
	>[] {
		return this.requirements;
	}

	process(...args: DatumProcessorRequirementsResponse[]): FeatureValue {
		return this.fn(...args);
	}
}
