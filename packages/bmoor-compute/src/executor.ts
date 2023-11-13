// import { DatumAccessorInterface} from './datum/accessor.interface';
import {Context} from '@bmoor/context';

import {DatumInterface} from './datum.interface';
import {DatumAccessor} from './datum/accessor';
import {DatumAccessorResponse} from './datum/accessor.interface';
import {DatumProcessor} from './datum/processor';
import {
	DatumProcessorRequirement,
	DatumProcessorRequirementsResponse,
	DatumProcessorResponse,
} from './datum/processor.interface';
import {DatumRanker} from './datum/ranker';
import {EnvironmentInterface} from './environment.interface';
import {ExecutorAction, ExecutorResponse} from './executor.interface';
import {IntervalInterface} from './interval.interface';

function shouldVerbose(ctx: Context, datum: {ref: string}){
	return ctx.hasFlag('verbose') && (
		!ctx.hasFlag('reference') || datum.ref.indexOf(ctx.getFlag('reference')) !== -1
	);
}

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

async function loadProcessorRequirement<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
>(
	ctx: Context,
	exe: Executor<GraphSelector, NodeSelector, IntervalRef, Order>,
	req: DatumProcessorRequirement<NodeSelector, IntervalRef>,
	datum: DatumInterface<NodeSelector>,
	interval: IntervalInterface<IntervalRef, Order>,
): Promise<DatumProcessorRequirementsResponse> {
	const newInterval = req.offset
		? exe.env.offsetInterval(interval, req.offset)
		: interval;
	const newDatum = exe.env.intervalSelect(
		datum,
		newInterval,
		!!req.strict,
	);

	if (shouldVerbose(ctx, datum)) {
		ctx.log('-> loadProcessorRequirement', newDatum.ref, newInterval.ref);
	}

	let action = null;
	let input = null;
	if (req.input instanceof DatumAccessor) {
		action = 'access';
		input = <DatumAccessor<NodeSelector, IntervalRef>>req.input;
	} else {
		action = 'process';
		input = <DatumProcessor<NodeSelector, IntervalRef>>req.input;
	}

	if ('range' in req) {
		if (shouldVerbose(ctx, datum)) {
			ctx.log('-> process:range', newDatum.ref, newInterval.ref, req);
		}

		let timeline = null;
		try {
			timeline = exe.env.rangeSelect(newDatum, newInterval, req.range, {
				strict: req.strict,
			});
		} catch (ex) {
			ctx.setError(ex).addErrorContext({
				code: 'PROCESSOR_RANGE_FAIL',
				protected: {
					ref: newDatum.ref,
					interval: newInterval,
					range: req.range,
				},
			});

			throw ex;
		}

		const rtn = [];

		for (const [subInterval, subDatum] of timeline.entries()) {
			rtn.push(exe[action](ctx, input, subDatum, subInterval));
		}

		return Promise.all(rtn);
	} else if ('select' in req) {
		if (shouldVerbose(ctx, datum)) {
			ctx.log('-> process:select', newDatum.ref, newInterval.ref, req);
		}

		let subDatums = null;
		try {
			subDatums = newDatum.select(req.select);
		} catch (ex) {
			ctx.setError(ex).addErrorContext({
				code: 'PROCESSOR_SELECT_FAIL',
				protected: {
					ref: newDatum.ref,
					select: req.select,
				},
			});

			throw ex;
		}

		if (req.reduce) {
			return exe[action](ctx, input, subDatums[0], newInterval);
		} else {
			const rtn = [];

			for (const subDatum of subDatums) {
				rtn.push(exe[action](ctx, input, subDatum, newInterval));
			}

			return Promise.all(rtn);
		}
	} else {
		if (shouldVerbose(ctx, datum)) {
			ctx.log('-> process:action', newDatum.ref, newInterval.ref, req);
		}

		return exe[action](ctx, input, newDatum, newInterval);
	}
}

async function runProcessor<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
>(
	ctx: Context,
	exe: Executor<GraphSelector, NodeSelector, IntervalRef, Order>,
	processor: DatumProcessor<NodeSelector, IntervalRef>,
	datum: DatumInterface<NodeSelector>,
	interval: IntervalInterface<IntervalRef, Order>,
): Promise<DatumProcessorResponse> {
	const requirements = processor.getRequirements();

	if (shouldVerbose(ctx, datum)) {
		ctx.log('-> processor:requesting', datum.ref, interval.ref, processor.name);
	}

	const reqs = await Promise.all(
		requirements.map((req) =>
			loadProcessorRequirement(ctx, exe, req, datum, interval),
		),
	);

	if (shouldVerbose(ctx, datum)) {
		ctx.log(
			'-> processor:response',
			datum.ref,
			interval.ref,
			processor.name,
			reqs,
		);
	}

	return processor.process(...reqs);
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
				ctx.log(
					'processor ==>',
					datum.ref,
					interval.ref,
					processor.name,
				);
			}

			const comparable = datum.select(processor.settings.select);

			let found = false;
			for (let i = 0; i < comparable.length && !found; i++) {
				found = comparable[i].equals(datum);
			}

			if (!found) {
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

					const length = processor.settings.buckets
						? Math.floor(pairings.length / processor.settings.buckets)
						: 1;

					if (shouldVerbose(ctx, datum)) {
						ctx.log(
							'-> rank',
							datum.ref,
							interval.ref,
							processor.name,
							pairings,
						);
					}

					pairings.map(({datum}, i) => {
						// Don't to 'rank 0', bump by 1
						results.set(datum.ref, Math.floor(i / length) + 1);
					});

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

