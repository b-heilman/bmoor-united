import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface.ts';
import type {DatumComputeSettings} from './compute.interface.ts';
import type {DatumOffsetContext} from './offset.interface.ts';
import {DatumOffset} from './offset.ts';
import type {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface.ts';

export class DatumCompute<
	ResponseT,
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumOffsetContext<DatumT, SelectT>,
> implements DatumReaderInterface<ResponseT, DatumT, EnvT> {
	name: string;
	accessor: DatumOffset<RequirementT, DatumT, SelectT, EnvT>;
	settings: DatumComputeSettings<ResponseT, RequirementT, SelectT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumComputeSettings<ResponseT, RequirementT, SelectT>,
	) {
		this.name = name;
		this.settings = settings;
		this.accessor = new DatumOffset(
			name + '_accessor',
			requirements,
			settings,
		);
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: DatumT[],
	): Promise<ResponseT[]> {
		const res = await this.accessor.process(ctx, env, datums);

		return res.map((res) => this.settings.reducer(res));
	}
}
