import {ComputeUnknownInterval} from '@bmoor/compute';
import {Context} from '@bmoor/context';
import {NodeReference, load as loadSection} from '@bmoor/graph';
import {OrderedMap} from '@bmoor/index';

import type {GraphComputeDatumInterface} from './datum.interface.ts';
import {GraphComputeDatum} from './datum.ts';
import type {
	GraphComputeInterface,
	GraphComputeJSON,
	GraphComputeSelector,
} from './graph.interface.ts';
import {GraphComputeSection} from './graph/section.ts';
import type {
	IntervalInterface,
	IntervalReference,
} from './interval.interface.ts';
import {Interval} from './interval.ts';

export class GraphCompute implements GraphComputeInterface<
	GraphComputeDatumInterface<GraphComputeSelector>,
	GraphComputeSelector
> {
	sections: OrderedMap<
		IntervalReference,
		GraphComputeSection<
			GraphComputeDatumInterface<GraphComputeSelector>,
			GraphComputeSelector
		>
	>;
	intervals: Map<IntervalReference, IntervalInterface>;

	constructor() {
		this.sections = new OrderedMap<
			IntervalReference,
			GraphComputeSection<
				GraphComputeDatumInterface<GraphComputeSelector>,
				GraphComputeSelector
			>
		>();
		this.intervals = new Map<IntervalReference, IntervalInterface>();
	}

	hasInterval(intervalRef: IntervalReference) {
		return this.intervals.has(intervalRef);
	}

	addInterval(interval: IntervalInterface) {
		this.intervals.set(interval.ref, interval);
	}

	getInterval(intervalRef: IntervalReference): IntervalInterface {
		const rtn = this.intervals.get(intervalRef);

		if (!rtn) {
			throw new ComputeUnknownInterval('unknown interval: ' + intervalRef);
		}

		return rtn;
	}

	hasSection(interval: IntervalInterface) {
		return this.sections.has(interval.ref);
	}

	addSection(
		section: GraphComputeSection<
			GraphComputeDatumInterface<GraphComputeSelector>,
			GraphComputeSelector
		>,
	) {
		this.sections.set(section.interval.ref, section);

		if (!this.hasInterval(section.interval.ref)) {
			this.addInterval(section.interval);
		}
	}

	getSection(interval: IntervalInterface) {
		let section = this.sections.get(interval.ref);

		if (!section) {
			section = new GraphComputeSection<
				GraphComputeDatumInterface<GraphComputeSelector>,
				GraphComputeSelector
			>((node) => new GraphComputeDatum(node, section, this));

			section.setInterval(interval, this);

			this.addSection(section);
		}

		return section;
	}

	getDatum(
		ref: NodeReference,
		interval: IntervalInterface | IntervalReference,
	): GraphComputeDatumInterface<GraphComputeSelector> {
		if (typeof interval === 'string') {
			interval = this.getInterval(interval);
		}

		return this.getSection(interval).getDatum(ref);
	}

	//getGraphSeries(start: Interval, stop: Interval): Graph[] {
	//	return Array.from(
	//		this.sections.getBetween(start.ref, stop.ref).values(),
	//	);
	//}

	select(
		base: GraphComputeDatum<GraphComputeSelector>,
		selector: GraphComputeSelector,
	): GraphComputeDatumInterface<GraphComputeSelector>[] {
		if (selector.across) {
			selector.across = null;
			return Object.values(this.sections).flatMap((section) =>
				section.select(selector),
			);
		} else if (selector.interval) {
			const interval =
				typeof selector.interval === 'string'
					? this.getInterval(selector.interval)
					: selector.interval;

			selector.interval = null;
			return this.getSection(interval).select(base, selector);
		} else {
			return base.select(selector);
		}
	}

	range(
		base: GraphComputeDatumInterface<GraphComputeSelector>,
		range: number,
		strict = false,
	): GraphComputeDatumInterface<GraphComputeSelector>[] {
		const interval = base.graph.interval;
		const offset = interval.ref;
		const rtn = [];
		const begin = this.sections.getTagOffset(offset, 1 - range, true);

		for (const section of this.sections
			.getBetween(offset, begin)
			.values()) {
			rtn.push(section.getDatum(base.getReference()));
		}

		if (strict && rtn.length !== range) {
			throw new Error(
				`not able to range (${base.getReference()}, ${base.graph.interval.ref}, ${range}, ${rtn.length})`,
			);
		}

		return rtn;
	}

	offset(
		base: GraphComputeDatumInterface<GraphComputeSelector>,
		offset: number,
		strict = false,
	): GraphComputeDatumInterface<GraphComputeSelector> {
		const newIntervalRef = this.sections.getTagOffset(
			base.graph.interval.ref,
			-offset,
			!strict,
		);

		if (!newIntervalRef && strict) {
			throw new Error(
				`not able to offset (${base.getReference()}, ${base.graph.interval.ref}, ${offset}, ${newIntervalRef})`,
			);
		}

		// console.log('Env:offset =>', base.node.ref, base.graph.interval.ref, offset, newIntervalRef);
		return this.sections.get(newIntervalRef).getDatum(base.getReference());
	}
	/*
	intervalSelect(
		datum: GraphDatum,
		interval: Interval,
		strict = false,
	): GraphDatum {
		let graph = this.sections.get(interval.ref);
		let node = graph.getNode(datum.node.ref);

		if (strict && !node) {
			throw new Error(
				'strict: could not interval select ' +
					datum.node.ref +
					' in interval ' +
					interval.ref,
			);
		} else {
			let cur = this.sections.getPrevTag(interval.ref);
			while (cur && !node) {
				graph = this.sections.get(cur);
				node = graph.getNode(datum.node.ref);

				cur = this.sections.getPrevTag(cur);
			}

			if (!node) {
				throw new Error(
					'relaxed: could not interval select ' +
						datum.node.ref +
						' in interval ' +
						interval.ref,
				);
			}
		}

		return new GraphDatum(node, graph);
	}
	*/

	toJSON(): GraphComputeJSON {
		const intervals = [];
		const sections = {};

		for (const intervalRef of this.sections.tags) {
			const interval = this.intervals.get(intervalRef);
			const graph = this.sections.get(intervalRef);

			intervals.push(interval.toJSON());
			sections[intervalRef] = graph.toJSON();
		}

		return {
			intervals,
			sections,
		};
	}
}

export function dump(graph: GraphCompute): GraphComputeJSON {
	return graph.toJSON();
}

export function load(
	ctx: Context,
	schema: GraphComputeJSON,
): GraphCompute {
	const graph = new GraphCompute();

	const intervals = [];
	for (const input of schema.intervals) {
		intervals.push(new Interval(input.ref, input.order, input.label));
	}

	intervals
		.sort((a: Interval, b: Interval) => a.order - b.order)
		.forEach((interval) => {
			graph.addInterval(interval);
		});

	// TODO: I need to do this where I can sort the intervals after insertion easier, so insert
	//   order doesn't matter.  This works for now, but isn't sound logically.
	for (const interval of intervals) {
		const graphInput = schema.sections[interval.ref];
		const section: GraphComputeSection<
			GraphComputeDatumInterface<GraphComputeSelector>,
			GraphComputeSelector
		> = loadSection(
			ctx,
			graphInput,
			(root) =>
				new GraphComputeSection<
					GraphComputeDatumInterface<GraphComputeSelector>,
					GraphComputeSelector
				>((node) => new GraphComputeDatum(node, section, graph), root),
		);

		section.setInterval(graph.getInterval(interval.ref), graph);

		graph.addSection(section);
	}

	return graph;
}
