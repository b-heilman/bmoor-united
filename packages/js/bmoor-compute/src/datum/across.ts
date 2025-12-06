import {Context} from '@bmoor/context';

import type {
	DatumInterface,
	FeatureReference,
} from '../datum.interface.ts';
import type {
	DatumAcrossContext,
	DatumAcrossSettings,
} from './across.interface.ts';
import {DatumOffset} from './offset.ts';
import type {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface.ts';

export class DatumAcross<
	ResponseT,
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumAcrossContext<DatumT, SelectT>,
> implements DatumReaderInterface<ResponseT, DatumT, EnvT> {
	name: string;
	accessor: DatumOffset<RequirementT, DatumT, SelectT, EnvT>;
	settings: DatumAcrossSettings<ResponseT, RequirementT, SelectT>;
	reducer: (args: RequirementT[]) => ResponseT;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumAcrossSettings<ResponseT, RequirementT, SelectT>,
	) {
		this.name = name;
		this.accessor = new DatumOffset<RequirementT, DatumT, SelectT, EnvT>(
			name,
			requirements,
			// remove the select from the accessor request, the select
			// SHOULD be different.  Not sure how to make sure it is...
			Object.assign({}, settings, {select: null}),
		);
		this.settings = settings;
	}

	select(ctx: EnvT, datums: DatumT[]): DatumT[][] {
		return datums.map((datum) => {
			return ctx.select(datum, Object.assign({}, this.settings.select));
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
