import {DatumProcessor} from '@bmoor/compute';
import {NodeSelector} from '@bmoor/graph';

import {IntervalReference} from '../interval.interface';

export class DimensionalDatumProcessor extends DatumProcessor<
	NodeSelector,
	IntervalReference
> {}
