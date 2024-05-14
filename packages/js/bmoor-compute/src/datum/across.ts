import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {DatumAcrossContext, DatumAcrossSettings} from './across.interface';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';

export class DatumAcross<
	SelectT,
	ResponseT,
	EnvT extends DatumAcrossContext<SelectT>,
	RequirementT,
> implements DatumActionInterface<ResponseT, EnvT>
{
	name: string;
	accessor: DatumAccessor<RequirementT, EnvT>;
	settings: DatumAcrossSettings<SelectT>;
	reducer: (args: RequirementT[]) => ResponseT;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, EnvT>,
		settings: DatumAcrossSettings<SelectT>,
		reducer: (args: RequirementT[]) => ResponseT,
	) {
		this.name = name;
		this.accessor = new DatumAccessor<RequirementT, EnvT>(
			name,
			requirements,
			settings,
		);
		this.settings = settings;
		this.reducer = reducer;
	}

	select(ctx: EnvT, datums: IDatum[]): IDatum[][] {
		return datums.map((datum) => {
			return ctx.select(datum, this.settings.select);
		});
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: IDatum[],
	): Promise<ResponseT[]> {
		const selected = this.select(env, datums);

		return Promise.all(
			selected.map(async (datumAcross) => {
				// This will apply the offset.  Technically this is not optimal but I'm gonna
				// let it go for now.  Optimal would be offset => range
				return this.reducer(
					await this.accessor.process(ctx, env, datumAcross),
				);
			}),
		);
	}
}
