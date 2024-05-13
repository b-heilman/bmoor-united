import {DatumAccessor} from './accessor';
import {IDatum, FeatureReference} from '../datum.interface';
import { DatumActionInterface, DatumActionRequirements } from './action.interface';
import { DatumRankerContext, DatumRankerSettings } from './ranker.interface';

export class DatumRanker<
	SelectT, ContextT extends DatumRankerContext<SelectT>, RequirementT
> implements DatumActionInterface<number, ContextT>
{
	accessor: DatumAccessor<RequirementT, ContextT>;
	settings: DatumRankerSettings<SelectT>
	reducer: (args: RequirementT) => number;

	constructor(
        name: FeatureReference,
        requirements: DatumActionRequirements<RequirementT, ContextT>,
		settings: DatumRankerSettings<SelectT>,
        reducer: (args: RequirementT) => number
    ){
		this.accessor = new DatumAccessor<RequirementT, ContextT>(name, requirements, settings);
		this.settings = settings;
		this.reducer = reducer;
    }

	select(ctx: ContextT, datums: IDatum[]): IDatum[][] {
		return datums.map(datum => {
			return ctx.select(datum, this.settings.select);
		});
	}

	async process(ctx: ContextT, reference: FeatureReference, datums: IDatum[]): Promise<number[]> {
		const selected = this.select(ctx, datums);

		const sorter = (this.settings.asc) ?
			(a, b) => a.value - b.value :
			(a, b) => b.value - a.value;

		await Promise.all(
			selected.map(async (toRank) => {
				const compare = await Promise.all(toRank.map(
					async (datum) => ({
						datum,
						value: this.reducer(
							(await this.accessor.process(ctx, reference, [datum]))[0]
						)
					})
				));

				const length = this.settings.bucketSize
					? this.settings.bucketSize
					: this.settings.bucketsCount
						? Math.ceil(
								compare.length / this.settings.bucketsCount,
							)
						: 1;

				await Promise.all(compare.sort(sorter).map(
					(r, i) => r.datum.setValue(reference, Math.floor(i / length))
				));
			})
		);

		return <Promise<number[]>>Promise.all(datums.map(d => d.getValue(reference, () => null)));
	}
}
