import {DatumRanker} from '@bmoor/compute';
import {NodeSelector} from '@bmoor/graph';

import {IntervalReference} from '../interval.interface';

export class DimensionalDatumRanker extends DatumRanker<
	NodeSelector,
	IntervalReference
> {}
