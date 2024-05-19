import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';
import { DatumComputeSettings } from './compute.interface';

export class DatumCompute<
	ResponseT,
	RequirementT,
	DatumT extends IDatum,
	EnvT extends DatumAccessorContext<DatumT>,
> implements DatumActionInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	settings: DatumComputeSettings<ResponseT, RequirementT>;
	accessor: DatumAccessor<RequirementT, DatumT, EnvT>;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumComputeSettings<ResponseT, RequirementT>
	) {
		this.name = name;
		// TODO: no need to cashe this, just like range
		this.settings = settings;
		this.accessor = new DatumAccessor(name+'_accessor', requirements, settings);
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
