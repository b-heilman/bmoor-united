import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';
import {DatumRangeContext, DatumRangeSettings} from './range.interface';

export class DatumRange<
	ResponseT,
	DatumT extends IDatum,
	EnvT extends DatumRangeContext<DatumT>,
	RequirementT,
> implements DatumActionInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	accessor: DatumAccessor<RequirementT, DatumT, EnvT>;
	settings: DatumRangeSettings<ResponseT, RequirementT>;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumRangeSettings<ResponseT, RequirementT>
	) {
		this.name = name;
		this.accessor = new DatumAccessor(
			name+'_accessor', // TODO: i don't need to save this to the datum... it's noise
			requirements,
			settings,
		);
		this.settings = settings;
	}

	select(ctx: EnvT, datums: DatumT[]): DatumT[][] {
		return datums.map((datum) => {
			return ctx.range(datum, this.settings.range, this.settings.strict);
		});
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: DatumT[],
	): Promise<ResponseT[]> {
		const selected = this.select(env, datums);

		return Promise.all(
			selected.map(async (datumRange) => {
				const res = await this.accessor.process(ctx, env, datumRange);
				// This will apply the offset.  Technically this is not optimal but I'm gonna
				// let it go for now.  Optimal would be offset => range
				return this.settings.reducer(res);
			}),
		);
	}
}
