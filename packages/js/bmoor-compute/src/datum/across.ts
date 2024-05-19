import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {DatumAcrossContext, DatumAcrossSettings} from './across.interface';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';

export class DatumAcross<
	RequirementT,
	DatumT extends IDatum,
	EnvT extends DatumAcrossContext<DatumT, SelectT>,
	ResponseT,
	SelectT,
> implements DatumActionInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	accessor: DatumAccessor<RequirementT, DatumT, EnvT>;
	settings: DatumAcrossSettings<RequirementT, ResponseT, SelectT>;
	reducer: (args: RequirementT[]) => ResponseT;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumAcrossSettings<RequirementT, ResponseT, SelectT>,
	) {
		this.name = name;
		this.accessor = new DatumAccessor<RequirementT, DatumT, EnvT>(
			name,
			requirements,
			settings,
		);
		this.settings = settings;
	}

	select(ctx: EnvT, datums: DatumT[]): DatumT[][] {
		return datums.map((datum) => {
			return ctx.select(datum, this.settings.select);
		});
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: DatumT[],
	): Promise<ResponseT[]> {
		const selected = this.select(env, datums);

		return Promise.all(
			selected.map(async (datumAcross) => {
				// This will apply the offset.  Technically this is not optimal but I'm gonna
				// let it go for now.  Optimal would be offset => range
				return this.settings.reducer(
					await this.accessor.process(ctx, env, datumAcross),
				);
			}),
		);
	}
}
