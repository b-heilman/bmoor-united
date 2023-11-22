import {DatumRanker} from '@bmoor/compute';
import {GraphSelector} from '@bmoor/graph';

import {IntervalReference} from '../interval.interface';

export class DimensionalDatumRanker extends DatumRanker<
	GraphSelector,
	IntervalReference
> {}
