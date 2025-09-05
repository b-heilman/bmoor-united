import {GraphLoaderRow, GraphLoaderSettings} from '@bmoor/graph';

import {IntervalInterface} from '../interval.interface.ts';

export type LoaderIntervalGenerator = (
	row: GraphLoaderRow,
	nextPos: number,
) => IntervalInterface;

export interface GraphComputeLoaderSettings extends GraphLoaderSettings {
	generateInterval: LoaderIntervalGenerator;
}
