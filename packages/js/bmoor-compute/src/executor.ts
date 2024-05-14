// import { DatumAccessorInterface} from './datum/accessor.interface';
import {Context} from '@bmoor/context';

import {DatumActionInterface} from './datum/action.interface';
import {EnvironmentInterface} from './environment.interface';
import {ExecutorResponse} from './executor.interface';
import {IntervalInterface} from './interval.interface';

/****
 * TODO: reimplement
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
export class Executor<GraphSelector, NodeSelector, IntervalRef, Order> {
	env: EnvironmentInterface<
		GraphSelector,
		NodeSelector,
		IntervalRef,
		Order
	>;

	constructor(
		env: EnvironmentInterface<
			GraphSelector,
			NodeSelector,
			IntervalRef,
			Order
		>,
	) {
		this.env = env;
	}

	// run a definition and pull back the value
	async calculate<ResponseT>(
		interval: IntervalInterface<IntervalRef, Order>,
		action: DatumActionInterface<
			ResponseT,
			EnvironmentInterface<GraphSelector, NodeSelector, IntervalRef, Order>
		>,
		select: GraphSelector,
		ctx: Context = new Context({}),
	): Promise<ExecutorResponse[]> {
		const selection = this.env.select(interval, select);

		if (ctx.hasFlag('verbose')) {
			ctx.log('-> select', interval.ref, select, selection);
		}

		return action.process(ctx, this.env, selection);
	}
}
