import {
	ActionInterface,
	ActionReference,
	ActionRequirement,
	ActionRequirementAction,
	ActionRequirementFeature,
} from './action.interface';
import {DatumInterface} from './datum.interface';
import {EnvironmentInterface} from './environment.interface';
import {IntervalInterface} from './interval.interface';
import {RegistryInterface} from './registry.interface';

export class Executor<GraphSelector, NodeSelector, IntervalRef, Order> {
	env: EnvironmentInterface<
		GraphSelector,
		NodeSelector,
		IntervalRef,
		Order
	>;
	reg: RegistryInterface<NodeSelector, IntervalRef>;

	constructor(
		env: EnvironmentInterface<
			GraphSelector,
			NodeSelector,
			IntervalRef,
			Order
		>,
		reg: RegistryInterface<NodeSelector, IntervalRef>,
	) {
		this.env = env;
		this.reg = reg;
	}

	async require(
		requirement: ActionRequirement<NodeSelector, IntervalRef>,
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
	): Promise<number | number[]> {
		const feature = (<ActionRequirementFeature<NodeSelector>>requirement)
			.feature;
		const action = (<ActionRequirementAction<NodeSelector, IntervalRef>>(
			requirement
		)).action;
		const newInterval = requirement.offset
			? this.env.offsetInterval(interval, requirement.offset)
			: interval;

		/**
		 * My problem is that I need to handle...
		 * - subselect (one or more) => number[]
		 * - offset => number
		 * - range => number[]
		 *****
		 * can I allow you to mix a subselect with a range?  I think no...
		 * A select is to pick other nodes, where a a range is to pick over time.  Logic would be to
		 * run the select, and then pick the range, but that would make it number[][]
		 */
		if (requirement.range) {
			const timeline = this.env.rangeSelect(
				datum,
				newInterval,
				requirement.range,
			);
			const rtn = [];

			if (action) {
				for (const [subInterval, subDatum] of timeline.entries()) {
					rtn.push(this.execute(action, subDatum, subInterval));
				}
			} else {
				for (const subDatum of timeline.values()) {
					rtn.push(subDatum.getValue(<string>feature));
				}
			}

			return Promise.all(rtn);
			// TODO: need to implement a subselect
		} else {
			if (action) {
				return this.execute(action, datum, newInterval);
			} else {
				return this.env
					.intervalSelect(datum, newInterval)
					.getValue(<string>feature);
			}
		}
	}

	async execute(
		action: ActionInterface<NodeSelector, IntervalRef>,
		datum: DatumInterface<NodeSelector>,
		interval: IntervalInterface<IntervalRef, Order>,
	): Promise<number> {
		if (datum.hasValue(action.ref)) {
			return datum.getValue(action.ref);
		} else {
			const requirements = action.getRequirements();

			const value = await action.execute(
				await Promise.all(
					requirements.map((req) => this.require(req, datum, interval)),
				),
			);

			datum.setValue(action.ref, value);

			return value;
		}
	}

	// run a definition and pull back the value
	async calculate(
		interval: IntervalInterface<IntervalRef, Order>,
		ref: ActionReference,
		select: GraphSelector,
	): Promise<number[]> {
		const action = this.reg.getAction(ref);
		const selection = this.env.select(interval, select);

		if (!action) {
			throw new Error(`action ${ref} not registered`);
		}

		return Promise.all(
			selection.datums.map((datum) =>
				this.execute(action, datum, interval),
			),
		);
	}
}
