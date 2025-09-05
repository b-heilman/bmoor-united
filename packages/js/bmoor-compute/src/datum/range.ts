import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface.ts';
import {DatumOffset} from './offset.ts';
import {DatumRangeContext, DatumRangeSettings} from './range.interface.ts';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface.ts';

export class DatumRange<
	ResponseT,
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumRangeContext<DatumT, SelectT>,
> implements DatumReaderInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	accessor: DatumOffset<RequirementT, DatumT, SelectT, EnvT>;
	settings: DatumRangeSettings<ResponseT, RequirementT, SelectT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumRangeSettings<ResponseT, RequirementT, SelectT>,
	) {
		this.name = name;
		this.accessor = new DatumOffset(
			name + '_accessor', // TODO: i don't need to save this to the datum... it's noise
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
