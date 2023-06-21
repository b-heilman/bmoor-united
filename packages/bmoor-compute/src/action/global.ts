import {Action} from '../action';
import {ActionReference} from '../action.interface';
import {DatumInterface, FeatureReference} from '../datum.interface';
import {ActionSelectTransformFn} from './select.interface';

export class ActionGlobal<Interval, Selector> extends Action<
	Interval,
	Selector
> {
	offset: number;
	feature: FeatureReference;
	override: Selector;
	fn: ActionSelectTransformFn;

	constructor(ref: ActionReference, feature: FeatureReference) {
		super(ref);

		this.feature = feature;
	}

	async eval(datum: DatumInterface<Interval>): Promise<number> {
		return this.env.getGlobal(datum.interval).getValue(this.feature);
	}
}
