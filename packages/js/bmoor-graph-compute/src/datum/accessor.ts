import {
	DatumAccessor,
	DatumAccessorRequest,
	DatumAccessorResponse,
	FeatureReference,
} from '@bmoor/compute';
import {GraphDatum, GraphSelector, NodeValueSelector} from '@bmoor/graph';

import {IntervalReference} from '../interval.interface';

export class DimensionalDatumAccessor extends DatumAccessor<
	GraphSelector,
	IntervalReference
> {
	modes: Record<FeatureReference, NodeValueSelector>;

	constructor(
		attrs: DatumAccessorRequest<GraphSelector, IntervalReference>,
		modes: Record<FeatureReference, NodeValueSelector> = {},
	) {
		super(attrs);

		this.modes = modes;
	}

	isReady(datum: GraphDatum) {
		const args = Object.values(this.request);

		for (const arg of args) {
			let attr = null;
			let mode = null;

			if (typeof arg == 'string') {
				// If a plain string, it will be reading from an event
				attr = arg;
				mode = this.modes[arg] || NodeValueSelector.event;
			} else {
				// If a processor, we look to the node, never event
				attr = arg.name;
				mode = NodeValueSelector.node;
			}

			if (!datum.hasValue(attr, mode)) {
				return false;
			}
		}

		return true;
	}

	async read(datum: GraphDatum): Promise<DatumAccessorResponse> {
		const args = Object.values(this.request);

		const values = await Promise.all(
			args.map((arg) => {
				let attr = null;
				let mode = null;

				if (typeof arg == 'string') {
					// If a plain string, it will be reading from an event
					attr = arg;
					mode = this.modes[arg] || NodeValueSelector.event;
				} else {
					// If a processor, we look to the node, never event
					attr = arg.name;
					mode = NodeValueSelector.node;
				}

				return datum.getValue(attr, mode);
			}),
		);

		return Object.keys(this.request).reduce((agg, key, i) => {
			agg[key] = values[i];

			return agg;
		}, {});
	}
}
