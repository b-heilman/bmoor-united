import {GraphLoaderRow, GraphLoaderSettings} from '@bmoor/graph';

import {Interval} from '../interval';
import {IntervalReference} from '../interval.interface';

export type LoaderIntervalAccessor = (
	row: GraphLoaderRow,
) => IntervalReference;

export type LoaderIntervalGenerator = (
	ref: IntervalReference,
	row: GraphLoaderRow,
	nextPos: number,
) => Interval;

export interface DimensionalGraphLoaderSettings
	extends GraphLoaderSettings {
	readIntervalReference: LoaderIntervalAccessor;
	generateInterval: LoaderIntervalGenerator;
}
