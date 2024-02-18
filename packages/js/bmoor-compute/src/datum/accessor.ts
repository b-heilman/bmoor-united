import {DatumAccessor as DatumAccess} from '../datum.interface';
import {
	DatumAccessorInterface,
	DatumAccessorRequest,
	DatumAccessorResponse,
} from './accessor.interface';
import {DatumProcessorInterface} from './processor.interface';

export class DatumAccessor<NodeSelector, IntervalRef>
	implements DatumAccessorInterface<NodeSelector, IntervalRef>
{
	request: DatumAccessorRequest<NodeSelector, IntervalRef>;
	requirements: DatumProcessorInterface<NodeSelector, IntervalRef>[];

	constructor(attrs: DatumAccessorRequest<NodeSelector, IntervalRef>) {
		this.request = attrs;
		this.requirements = <
			DatumProcessorInterface<NodeSelector, IntervalRef>[]
		>Object.values(attrs).filter((attr) => typeof attr != 'string');
	}

	getRequirements(): DatumProcessorInterface<NodeSelector, IntervalRef>[] {
		return this.requirements;
	}

	isReady(datum: DatumAccess) {
		const args = Object.values(this.request);

		for (const arg of args) {
			const attr = typeof arg == 'string' ? arg : arg.name;
			if (!datum.hasValue(attr)) {
				return false;
			}
		}

		return true;
	}

	async read(datum: DatumAccess): Promise<DatumAccessorResponse> {
		const args = Object.values(this.request);

		const values = await Promise.all(
			args.map((arg) => {
				const attr = typeof arg == 'string' ? arg : arg.name;

				return datum.getValue(attr);
			}),
		);

		return Object.keys(this.request).reduce((agg, key, i) => {
			agg[key] = values[i];

			return agg;
		}, {});
	}
}
