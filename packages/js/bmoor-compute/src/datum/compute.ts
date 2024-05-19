import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {DatumAccessorContext, DatumAccessorSettings} from './accessor.interface';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';

export class DatumCompute<
	RequirementT,
	DatumT extends IDatum,
	EnvT extends DatumAccessorContext<DatumT>,
	ResponseT,
> implements DatumActionInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	accessor: DatumAccessor<RequirementT, DatumT, EnvT>;
	reducer: (args: RequirementT) => ResponseT;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumAccessorSettings,
		reducer: (args: RequirementT) => ResponseT,
	) {
		this.name;
		this.accessor = new DatumAccessor(name, requirements, settings);
		this.reducer = reducer;
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: DatumT[],
	): Promise<ResponseT[]> {
		const res = await this.accessor.process(ctx, env, datums);

		return res.map((res) => this.reducer(res));
	}
}
