import {Action} from '../action';
import {ActionFeature, ActionReference} from '../action.interface';
import {DatumInterface} from '../datum.interface';
import {ActionSelectTransformFn} from './select.interface';

export class ActionSelect<Interval, Selector> extends Action<
	Interval,
	Selector
> {
	offset: number;
	feature: ActionFeature<Interval, Selector>;
	override: Selector;
	fn: ActionSelectTransformFn;

	constructor(
		ref: ActionReference,
		feature: ActionFeature<Interval, Selector>,
		override?: Selector,
		fn: ActionSelectTransformFn = null,
	) {
		super(ref);

		this.fn = fn;
		this.feature = feature;
		this.override = override;
	}

	getRequirements(): Action<Interval, Selector>[] {
		if (this.feature instanceof Action) {
			return [this.feature];
		} else {
			return [];
		}
	}

	async eval(datum: DatumInterface<Interval>): Promise<number> {
		let tgt: DatumInterface<Interval> = null;

		if (this.override) {
			const select = this.env.subSelect(
				datum,
				datum.interval,
				this.override,
			);

			if (select.length > 1 && !this.fn) {
				throw new Error('Can not sub select > 1');
			}

			const datums = select;

			if (this.fn) {
				return this.fn(
					await Promise.all(
						datums.map((datum) => this.readFeature(datum, this.feature)),
					),
				);
			} else {
				tgt = datums[0];
			}
		} else {
			tgt = datum;
		}

		return this.readFeature(tgt, this.feature);
	}
}
