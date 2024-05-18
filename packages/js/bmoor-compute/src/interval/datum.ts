import {Datum} from '../datum';
import {IntervalInterface} from '../interval.interface';
import {
	IntervalDatumInterface,
	IntervalDatumSelector,
	IntervalDatumSettings,
} from './datum.interface';

export class IntervalDatum
	extends Datum
	implements IntervalDatumInterface
{
	interval: IntervalInterface;
	children: Map<string, IntervalDatum>;

	constructor(ref, settings: IntervalDatumSettings) {
		super(ref, settings);

		this.interval = settings.interval;
	}

	select(selector: IntervalDatumSelector): IntervalDatum[] {
		return <IntervalDatum[]>super.select(selector);
	}
}
