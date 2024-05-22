import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {DatumAccessorContext} from './accessor.interface';
import {DatumComputeSettings} from './compute.interface';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface';

export class DatumCompute<
	ResponseT,
	RequirementT,
	DatumT extends DatumInterface,
	EnvT extends DatumAccessorContext<DatumT>,
> implements DatumReaderInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	settings: DatumComputeSettings<ResponseT, RequirementT>;
	accessor: DatumAccessor<RequirementT, DatumT, EnvT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumComputeSettings<ResponseT, RequirementT>,
	) {
		this.name = name;
		// TODO: no need to cashe this, just like range
		this.settings = settings;
		this.accessor = new DatumAccessor(
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
