import {GraphLoaderRow, GraphLoaderSettings} from '@bmoor/graph';

import {Interval} from '../interval';

export type LoaderIntervalGenerator = (
	row: GraphLoaderRow,
	nextPos: number,
) => Interval;

export interface DimensionalGraphLoaderSettings
	extends GraphLoaderSettings {
	generateInterval: LoaderIntervalGenerator;
}
