import {Action} from '../action';
import {ActionFeature, ActionReference} from '../action.interface';
import {DatumInterface} from '../datum.interface';
import {ActionRangeTransformFn} from './range.interface';

export class ActionRange<Interval, Selector> extends Action<
	Interval,
	Selector
> {
	fn: ActionRangeTransformFn;
	range: number;
	offset: number;
	feature: ActionFeature<Interval, Selector>;

	constructor(
		ref: ActionReference,
		feature: ActionFeature<Interval, Selector>,
		range: number,
		fn: ActionRangeTransformFn,
		offset = 0,
	) {
		super(ref);

		this.fn = fn;
		this.range = range;
		this.offset = offset;
		this.feature = feature;
	}

	getRequirements(): Action<Interval, Selector>[] {
		if (this.feature instanceof Action) {
			return [this.feature];
		} else {
			return [];
		}
	}

	/**
	 * I would like to cache the range selections.  Not sure
	 * the best way to do that.
	 */
	async eval(datum: DatumInterface<Interval>): Promise<number> {
		let interval = datum.interval;

		if (this.offset) {
			interval = this.env.offsetInterval(interval, this.offset);
		}

		const values = await Promise.all(
			this.env
				.rangeSelect(datum, interval, this.range)
				// interval here needs to be the datum's interval
				.map((datum) => this.readFeature(datum, this.feature)),
		);

		return this.fn(values);
	}
}
