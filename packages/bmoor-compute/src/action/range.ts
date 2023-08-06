import {Action} from '../action';
import {
	ActionFeature,
	ActionReference,
	ActionRequirement,
} from '../action.interface';
import {ActionRangeTransformFn} from './range.interface';

export class ActionRange<NodeSelector, IntervalRef> extends Action<
	NodeSelector,
	IntervalRef
> {
	fn: ActionRangeTransformFn;
	range: number;
	feature: ActionFeature<NodeSelector, IntervalRef>;

	constructor(
		ref: ActionReference,
		feature: ActionFeature<NodeSelector, IntervalRef>,
		range: number,
		fn?: ActionRangeTransformFn,
	) {
		super(ref);

		this.fn = fn;
		this.range = range;
		this.feature = feature;
	}

	getRequirements(): ActionRequirement<NodeSelector, IntervalRef>[] {
		if (this.feature instanceof Action) {
			return [
				{
					action: this.feature,
					offset: 0,
					range: this.range,
				},
			];
		} else {
			return [
				{
					feature: <ActionReference>this.feature,
					offset: 0,
					range: this.range,
				},
			];
		}
	}

	async execute(includes: (number | number[])[]): Promise<number> {
		if (this.fn) {
			return this.fn(<number[]>includes[0]);
		} else {
			return <number>includes[0];
		}
	}
}
