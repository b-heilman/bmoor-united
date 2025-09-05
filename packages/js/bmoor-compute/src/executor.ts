// import { DatumOffsetInterface} from './datum/accessor.interface';
import {Context} from '@bmoor/context';

import {DatumInterface, FeatureValue} from './datum.interface.ts';
import {DatumReaderInterface} from './datum/reader.interface.ts';
import {
	EnvironmentInterface,
	EnvironmentSelector,
} from './environment.interface.ts';

/****
 * TODO: reimplement in selection logic
 * 
 * if (processor.settings.filter) {
	const stats = processor.settings.filter.stats
		? processor.settings.filter.stats(
				pairings.map((pair) => pair.value),
			)
		: null;

	const fn = processor.settings.filter.fn;
	const chosen = [];

	for (const pair of pairings) {
		// Remove datums we don't care about give them a default value
		if (fn(pair.value, stats)) {
			chosen.push(pair);
		} else {
			results.set(
				pair.datum.ref,
				processor.settings.filter.droppedValue,
			);
		}
	}

	pairings = chosen;
}
 ****/
export class Executor<
	DatumT extends DatumInterface,
	SelectorT extends EnvironmentSelector,
	EnvT extends EnvironmentInterface<DatumT, SelectorT>,
> {
	env: EnvT;

	constructor(env: EnvT) {
		this.env = env;
	}

	// run a definition and pull back the value

	async calculate<ResponseT extends FeatureValue>(
		datums: DatumT[],
		action: DatumReaderInterface<ResponseT, DatumT, EnvT>,
		ctx: Context = new Context({}),
	): Promise<ResponseT[]> {
		return Promise.all(
			datums.map(async (datum) =>
				datum.getValue(
					action.name,
					async () => (await action.process(ctx, this.env, [datum]))[0],
				),
			),
		);
	}
}
