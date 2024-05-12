// import { DatumAccessorInterface} from './datum/accessor.interface';
import {Context} from '@bmoor/context';

import {DatumInterface} from './datum.interface';
import {DatumAccessor} from './datum/accessor';
import {DatumAccessorResponse} from './datum/accessor.interface';
import {DatumProcessor, shouldVerbose} from './datum/processor';
import {
	DatumProcessorRequirement,
	DatumProcessorResponse,
} from './datum/range.interface';
import {DatumRanker} from './datum/ranker';
import {EnvironmentInterface} from './environment.interface';

import {ExecutorAction, ExecutorResponse} from './executor.interface';
import {IntervalInterface} from './interval.interface';

async function loadAccessorRequirement<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
>(
	ctx: Context,
	exe: Executor<GraphSelector, NodeSelector, IntervalRef, Order>,
	req: DatumProcessor<NodeSelector, IntervalRef>,
	datum: DatumInterface<NodeSelector>,
	interval: IntervalInterface<IntervalRef, Order>,
): Promise<DatumProcessorResponse> {
	return exe.process(ctx, req, datum, interval);
}

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

	async process(
		ctx: Context,
		processor: DatumProcessor<NodeSelector, IntervalRef>,
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
	): Promise<DatumProcessorResponse> {
		if (datum.hasValue(processor.name)) {
			return datum.getValue(processor.name);
		} else if (processor instanceof DatumRanker) {
			if (shouldVerbose(ctx, datum)) {
				ctx.log('processor ==>', datum.ref, interval.ref, processor.name);
			}

			const comparable = datum.select(processor.settings.select);

			let found = false;
			for (let i = 0; i < comparable.length && !found; i++) {
				found = comparable[i].equals(datum);
			}

			if (!found) {
				// This should be a custom error being thrown or something else... it's silently failing
				// somewhere right now
				if (shouldVerbose(ctx, datum)) {
					ctx.log(
						'-> miss',
						datum.ref,
						interval.ref,
						processor.name,
						processor.settings.select,
					);
				}

				throw new Error('selection must contain original datum');
			} else {
				const compute = Promise.all(
					comparable.map(async (datum) => {
						// The promise needs to be defined before this call...
						const value = <number>(
							await runProcessor(ctx, this, processor, datum, interval)
						);

						return {
							value,
							datum,
						};
					}),
				).then((pairings) => {
					const results = new Map();

					if (processor.settings.asc) {
						pairings.sort((a, b) => a.value - b.value);
					} else {
						pairings.sort((a, b) => b.value - a.value);
					}

					// NOTE: If I sort first, does that make stat calculation more efficient which
					//   outweighs sorting data I con't care about?  Not going to pre-optimize, but
					//   might be something there
					if (processor.settings.filter) {
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

					const length = processor.settings.bucketSize
						? processor.settings.bucketSize
						: processor.settings.bucketsCount
							? Math.ceil(
									pairings.length / processor.settings.bucketsCount,
								)
							: 1;

					if (shouldVerbose(ctx, datum)) {
						ctx.log(
							'-> rank',
							datum.ref,
							interval.ref,
							processor.name,
							pairings,
						);
						ctx.log('rank by', length);
					}

					pairings.map(({datum}, i) => {
						// Don't to 'rank 0', bump by 1
						results.set(datum.ref, Math.floor(i / length) + 1);
					});

					if (shouldVerbose(ctx, datum)) {
						ctx.log(
							'-> rank',
							datum.ref,
							interval.ref,
							processor.name,
							pairings,
						);
						ctx.log('rank by', length);
						ctx.log(results);
					}

					return results;
				});

				await Promise.all(
					comparable.map(async (datum) =>
						datum.awaitValue(
							processor.name,
							compute.then((results) => results.get(datum.ref)),
						),
					),
				);

				return datum.getValue(processor.name);
			}
		} else {
			const value = await runProcessor(
				ctx,
				this,
				processor,
				datum,
				interval,
			);

			await datum.setValue(processor.name, value);

			return value;
		}
	}

	async access(
		ctx: Context,
		accessor: DatumAccessor<NodeSelector, IntervalRef>,
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
	): Promise<DatumAccessorResponse> {
		if (accessor.isReady(datum)) {
			return accessor.read(datum);
		} else {
			const requirements = accessor.getRequirements();

			await Promise.all(
				requirements.map((req) =>
					loadAccessorRequirement(
						ctx,
						this,
						<DatumProcessor<NodeSelector, IntervalRef>>req,
						datum,
						interval,
					),
				),
			);

			return accessor.read(datum);
		}
	}

	// run a definition and pull back the value
	async calculate(
		interval: IntervalInterface<IntervalRef, Order>,
		action: ExecutorAction<NodeSelector, IntervalRef>,
		select: GraphSelector,
		ctx: Context = new Context({}),
	): Promise<ExecutorResponse[]> {
		const selection = this.env.select(interval, select);

		if (ctx.hasFlag('verbose')) {
			ctx.log('-> select', interval.ref, select, selection);
		}

		return Promise.all(
			selection.map((datum) => {
				if (action instanceof DatumAccessor) {
					return this.access(ctx, action, datum, interval);
				} else {
					return this.process(ctx, action, datum, interval);
				}
			}),
		);
	}
}
