// import { DatumAccessorInterface} from './datum/accessor.interface';
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

async function loadAccessorRequirement<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
>(
	exe: Executor<GraphSelector, NodeSelector, IntervalRef, Order>,
	req: DatumProcessor<NodeSelector, IntervalRef>,
	datum: DatumInterface<NodeSelector>,
	interval: IntervalInterface<IntervalRef, Order>,
): Promise<DatumProcessorResponse> {
	return exe.process(req, datum, interval);
}

async function loadProcessorRequirement<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
>(
	exe: Executor<GraphSelector, NodeSelector, IntervalRef, Order>,
	req: DatumProcessorRequirement<NodeSelector, IntervalRef>,
	datum: DatumInterface<NodeSelector>,
	interval: IntervalInterface<IntervalRef, Order>,
): Promise<DatumProcessorRequirementsResponse> {
	const newInterval = req.offset
		? exe.env.offsetInterval(interval, req.offset)
		: interval;
	const newDatum = exe.env.intervalSelect(datum, newInterval);

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
		const timeline = exe.env.rangeSelect(newDatum, newInterval, req.range);

		const rtn = [];

		for (const [subInterval, subDatum] of timeline.entries()) {
			rtn.push(exe[action](input, subDatum, subInterval));
		}

		return Promise.all(rtn);
	} else if ('select' in req) {
		const subDatums = newDatum.select(req.select);

		if (req.reduce) {
			return exe[action](input, subDatums[0], newInterval);
		} else {
			const rtn = [];

			for (const subDatum of subDatums) {
				rtn.push(exe[action](input, subDatum, newInterval));
			}

			return Promise.all(rtn);
		}
	} else {
		return exe[action](input, newDatum, newInterval);
	}
}

async function runProcessor<
	GraphSelector,
	NodeSelector,
	IntervalRef,
	Order,
>(
	exe: Executor<GraphSelector, NodeSelector, IntervalRef, Order>,
	processor: DatumProcessor<NodeSelector, IntervalRef>,
	datum: DatumInterface<NodeSelector>,
	interval: IntervalInterface<IntervalRef, Order>,
): Promise<DatumProcessorResponse> {
	const requirements = processor.getRequirements();

	const reqs = await Promise.all(
		requirements.map((req) =>
			loadProcessorRequirement(exe, req, datum, interval),
		),
	);

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
		processor: DatumProcessor<NodeSelector, IntervalRef>,
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
	): Promise<DatumProcessorResponse> {
		if (datum.hasValue(processor.name)) {
			return datum.getValue(processor.name);
		} else if (processor instanceof DatumRanker) {
			const siblings = datum.select(processor.settings.select);

			let found = false;
			for (let i = 0; i < siblings.length && !found; i++) {
				found = siblings[i].equals(datum);
			}

			if (!found) {
				throw new Error('selection must contain original datum');
			} else {
				const pairings = await Promise.all(
					siblings.map(async (datum) => {
						const value = <number>(
							await runProcessor(this, processor, datum, interval)
						);

						return {
							value,
							datum,
						};
					}),
				);

				if (processor.settings.asc) {
					pairings.sort((a, b) => a.value - b.value);
				} else {
					pairings.sort((a, b) => b.value - a.value);
				}

				const length = processor.settings.buckets
					? pairings.length / processor.settings.buckets
					: 1;

				await pairings.map(({datum}, i) =>
					datum.setValue(processor.name, Math.floor(i / length)),
				);

				return datum.getValue(processor.name);
			}
		} else {
			const value = await runProcessor(this, processor, datum, interval);

			await datum.setValue(processor.name, value);

			return value;
		}
	}

	async access(
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
	): Promise<ExecutorResponse[]> {
		const selection = this.env.select(interval, select);

		return Promise.all(
			selection.map((datum) => {
				if (action instanceof DatumAccessor) {
					return this.access(action, datum, interval);
				} else {
					return this.process(action, datum, interval);
				}
			}),
		);
	}
}
