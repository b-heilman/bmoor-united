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
		label: IntervalLabel,
		order: IntervalOrder,
	) {
		this.ref = ref;
		this.label = label;
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
