import {
	IntervalInterface,
	IntervalLabel,
	IntervalOrder,
	IntervalReference,
} from './interval.interface';

export class Interval implements IntervalInterface {
	ref: IntervalReference;
	label: IntervalLabel;
	order: IntervalOrder;

	constructor(
		ref: IntervalReference,
		order: IntervalOrder,
		label: IntervalLabel = null,
	) {
		this.ref = ref;
		this.label = label || ref;
		this.order = order;
	}

	toJSON() {
		return {
			ref: this.ref,
			label: this.label,
			order: this.order,
		};
	}
}
