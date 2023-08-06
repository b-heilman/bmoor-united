import {DatumInterface} from '../datum.interface';

export type ActionRequireFn<Interval> = (
	datum: DatumInterface<Interval>,
) => Promise<number>;

export type ActionRequireThenFn = (
	...args: (number | number[])[]
) => number;
