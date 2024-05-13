import {DatumAccessor} from './accessor';
import {IDatum, FeatureReference} from '../datum.interface';
import { DatumActionInterface, DatumActionRequirements } from './action.interface';
import { DatumRangeContext, DatumRangeSettings } from './range.interface';

export class DatumRange<
	ResponseT, ContextT extends DatumRangeContext, RequirementT
> implements DatumActionInterface<ResponseT, ContextT>
{
	accessor: DatumAccessor<RequirementT, ContextT>;
	settings: DatumRangeSettings
	reducer: (args: RequirementT[]) => ResponseT;

	constructor(
        name: FeatureReference,
        requirements: DatumActionRequirements<RequirementT, ContextT>,
		settings: DatumRangeSettings,
        reducer: (args: RequirementT[]) => ResponseT
    ){
		this.accessor = new DatumAccessor<RequirementT, ContextT>(name, requirements, settings);
		this.settings = settings;
		this.reducer = reducer;
    }

	select(ctx: ContextT, datums: IDatum[]): IDatum[][] {
		return datums.map(datum => {
			return ctx.range(datum, this.settings.range);
		});
	}

	async process(ctx: ContextT, reference: FeatureReference, datums: IDatum[]): Promise<ResponseT[]> {
		const selected = this.select(ctx, datums);

		return Promise.all(
			selected.map(async (datumRange) => {
				// This will apply the offset.  Technically this is not optimal but I'm gonna
				// let it go for now.  Optimal would be offset => range
				return this.reducer(
					await this.accessor.process(ctx, reference, datumRange)
				);
			})
		);
	}
}
