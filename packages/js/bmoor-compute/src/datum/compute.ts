import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface';
import {DatumComputeSettings} from './compute.interface';
import {DatumOffset} from './offset';
import {DatumOffsetContext} from './offset.interface';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface';

export class DatumCompute<
	ResponseT,
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumOffsetContext<DatumT, SelectT>,
> implements DatumReaderInterface<ResponseT, DatumT, EnvT>
{
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
