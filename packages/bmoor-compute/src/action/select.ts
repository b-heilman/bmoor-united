import {Action} from '../action';
import {
	ActionFeature,
	ActionReference,
	ActionRequirement,
} from '../action.interface';
import {ActionSelectTransformFn} from './select.interface';

export class ActionSelect<NodeSelector, IntervalRef> extends Action<
	NodeSelector,
	IntervalRef
> {
	feature: ActionFeature<NodeSelector, IntervalRef>;
	override: NodeSelector;
	fn: ActionSelectTransformFn;

	constructor(
		ref: ActionReference,
		feature: ActionFeature<NodeSelector, IntervalRef>,
		override?: NodeSelector,
		fn: ActionSelectTransformFn = null,
	) {
		super(ref);

		this.fn = fn;
		this.feature = feature;
		this.override = override;
	}

	getRequirements(): ActionRequirement<NodeSelector, IntervalRef>[] {
		return [
			{
				feature: <ActionReference>this.feature,
				offset: 0,
			},
		];
	}

	async execute(includes: (number | number[])[]): Promise<number> {
		if (this.fn) {
			return this.fn(<number>includes[0]);
		} else {
			return <number>includes[0];
		}
	}
}
