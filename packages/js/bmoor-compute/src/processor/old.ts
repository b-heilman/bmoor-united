import {FeatureReference, FeatureValue} from '../datum.interface';
import {DatumAccessorInterface} from './accessor.interface';

export function shouldVerbose(ctx: Context, datum: {ref: string}) {
	return (
		ctx.hasFlag('verbose') &&
		(!ctx.hasFlag('reference') ||
			datum.ref.indexOf(ctx.getFlag('reference')) !== -1)
	);
}

export interface DatumProcessorSelect<NodeSelector, IntervalRef> {
	input?:
		| DatumProcessorInterface<NodeSelector, IntervalRef>
		| DatumAccessorInterface<NodeSelector, IntervalRef>;
	offset?: number; // how far back to look
	strict?: boolean; // if the node is missing, fail?
}

export interface DatumProcessorSelectAcross<NodeSelector, IntervalRef>
	extends DatumProcessorSelect<NodeSelector, IntervalRef> {
	select?: NodeSelector;
	reduce?: boolean;
}

export interface DatumProcessorSelectRange<NodeSelector, IntervalRef>
	extends DatumProcessorSelect<NodeSelector, IntervalRef> {
	range: number;
	strict?: boolean;
}

export type DatumProcessorRequirement<NodeSelector, IntervalRef> =
	| DatumProcessorSelect<NodeSelector, IntervalRef>
	| DatumProcessorSelectAcross<NodeSelector, IntervalRef>
	| DatumProcessorSelectRange<NodeSelector, IntervalRef>;

// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// https://www.rst.software/blog/advanced-typing-in-typescript-with-generics

export type DatumProcessorFunction<ResponseIndex> = (
	args: ResponseIndex,
) => FeatureValue;

export type DatumProcessorResponse = FeatureValue;

export interface DatumProcessorInterface<
	NodeSelector,
	IntervalRef,
	ResponseIndex = Record<string, unknown>,
> {
	name: FeatureReference;  

	getRequirements(): {
		[Property in keyof ResponseIndex]: DatumProcessorRequirement<
			NodeSelector,
			IntervalRef
		>;
	};

	process(ResponseIndex): DatumProcessorResponse;
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
): Promise<unknown> {
	let newInterval = null;

	try {
		newInterval = req.offset
			? exe.env.offsetInterval(interval, req.offset)
			: interval;
	} catch (ex) {
		// TODO: I need to look into handling this up higher in the stack.  This over weights the
		// oldest data, I should just reduce the range or offset.  This only effects the tail of
		// our data, so I just drop the tail from analysis
		if (ex instanceof ComputeUnknownInterval) {
			ctx.log('unknown offset', interval, req.offset);

			newInterval = interval;
		} else {
			throw ex;
		}
	}

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
		req.input.access()
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
			if (ex instanceof Error) {
				ctx.setError(ex).addErrorContext({
					code: 'PROCESSOR_RANGE_FAIL',
					protected: {
						ref: newDatum.ref,
						interval: newInterval,
						range: req.range,
					},
				});
			}

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

		let subDatums: DatumInterface<NodeSelector>[] = null;
		try {
			subDatums = newDatum.select(req.select);

			if (shouldVerbose(ctx, datum)) {
				ctx.log(
					'-> process:select:response',
					newDatum.ref,
					newInterval.ref,
					subDatums.map((node) => node.ref),
				);
			}
		} catch (ex) {
			if (ex instanceof Error) {
				ctx.setError(ex).addErrorContext({
					code: 'PROCESSOR_SELECT_FAIL',
					protected: {
						ref: newDatum.ref,
						select: req.select,
						requestInterval: interval,
						newInterval,
					},
				});
			}

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
		ctx.log(
			'-> processor:requesting',
			datum.ref,
			interval.ref,
			processor.name,
		);
	}

	let reqs = null;
	try {
		const values = await Promise.all(
			Object.values(requirements).map((req) =>
				loadProcessorRequirement(ctx, exe, req, datum, interval),
			),
		);

		reqs = Object.keys(requirements).reduce((agg, v, i) => {
			agg[v] = values[i];
			return agg;
		}, {});
	} catch (ex) {
		if (ex instanceof Error) {
			ctx.setError(ex, {
				code: 'BMOOR_COMPUTE_FAILED_PROC',
				protected: {
					ref: datum.ref,
					interval: interval.ref,
					processor: processor.name,
				},
			});
		}

		throw ex;
	}

	if (shouldVerbose(ctx, datum)) {
		ctx.log(
			'-> processor:response',
			datum.ref,
			interval.ref,
			processor.name,
			reqs,
		);
	}

	return processor.process(reqs);
}
