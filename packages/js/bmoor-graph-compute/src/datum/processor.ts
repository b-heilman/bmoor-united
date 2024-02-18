import {DatumProcessor} from '@bmoor/compute';
import {GraphSelector} from '@bmoor/graph';

import {IntervalReference} from '../interval.interface';

export class DimensionalDatumProcessor extends DatumProcessor<
	GraphSelector,
	IntervalReference
> {}
