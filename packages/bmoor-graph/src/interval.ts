import {Tags} from '@bmoor/tagging';

import {IntervalInterface, IntervalReference} from './interval.interface';

export class Interval implements IntervalInterface {
	ref: IntervalReference;
	label: string;
	tags: Tags;

	constructor(ref: IntervalReference, label: string, tags: Tags = []) {
		this.ref = ref;
		this.label = label;
		this.tags = tags;
	}

	toJSON() {
		return {
			ref: this.ref,
			label: this.label,
			tags: this.tags,
		};
	}
}
