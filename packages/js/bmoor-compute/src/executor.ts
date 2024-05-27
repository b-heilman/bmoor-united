// import { DatumAccessorInterface} from './datum/accessor.interface';
import {Context} from '@bmoor/context';

import {DatumInterface} from './datum.interface';
import {DatumReaderInterface} from './datum/reader.interface';
import {
	EnvironmentInterface,
	EnvironmentSelector,
} from './environment.interface';

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
	SelectorT extends EnvironmentSelector,
	DatumT extends DatumInterface,
	EnvT extends EnvironmentInterface<DatumT, SelectorT>,
> {
	env: EnvT;

	constructor(env: EnvT) {
		this.env = env;
	}

	// run a definition and pull back the value
	async calculate<ResponseT = any>( // eslint-disable-line  @typescript-eslint/no-explicit-any
		action: DatumReaderInterface<ResponseT, DatumT, EnvT>,
		select: SelectorT,
		ctx: Context = new Context({}),
	): Promise<ResponseT[]> {
		const selection = this.env.select(null, select);

		if (ctx.hasFlag('verbose')) {
			ctx.log('-> select', select, selection);
		}

		return action.process(ctx, this.env, selection);
	}
}
