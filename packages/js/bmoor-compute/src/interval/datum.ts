import {Datum} from '../datum.ts';
import type {IntervalInterface} from '../interval.interface.ts';
import type {
	IntervalDatumInterface,
	IntervalDatumSelector,
	IntervalDatumSettings,
} from './datum.interface.ts';

export class IntervalDatum
	extends Datum
	implements IntervalDatumInterface
{
	interval: IntervalInterface;
	children: Map<string, IntervalDatum>;

	constructor(ref, settings: IntervalDatumSettings) {
		super(ref, settings);
	}

	build(settings: IntervalDatumSettings) {
		this.interval = settings.interval;

		super.build(settings);
	}

	createChild(name, settings: IntervalDatumSettings): IntervalDatum {
		settings.interval = this.interval;
		const child = new IntervalDatum(name, settings);

		this.addChild(child);

		return child;
	}

	select(selector: IntervalDatumSelector): IntervalDatum[] {
		return <IntervalDatum[]>super.select(selector);
	}
}
