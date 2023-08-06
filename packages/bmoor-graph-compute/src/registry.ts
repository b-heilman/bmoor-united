import {Registry} from '@bmoor/compute';
import {NodeSelector} from '@bmoor/graph';

import {IntervalReference} from './interval.interface';

export class DimensionalRegistry extends Registry<
	NodeSelector,
	IntervalReference
> {}
