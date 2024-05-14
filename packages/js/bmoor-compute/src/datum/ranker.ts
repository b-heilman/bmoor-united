import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';
import {DatumRankerContext, DatumRankerSettings} from './ranker.interface';

export class DatumRanker<
	SelectT,
	EnvT extends DatumRankerContext<SelectT>,
	RequirementT,
> implements DatumActionInterface<number, EnvT>
{
	name: string;
	accessor: DatumAccessor<RequirementT, EnvT>;
	settings: DatumRankerSettings<SelectT>;
	reducer: (args: RequirementT) => number;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, EnvT>,
		settings: DatumRankerSettings<SelectT>,
		reducer: (args: RequirementT) => number,
	) {
		this.name;
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
	): Promise<number[]> {
		const selected = this.select(env, datums);

		const sorter = this.settings.asc
			? (a, b) => a.value - b.value
			: (a, b) => b.value - a.value;

		await Promise.all(
			selected.map(async (toRank) => {
				const compare = await Promise.all(
					toRank.map(async (datum) => ({
						datum,
						value: this.reducer(
							(await this.accessor.process(ctx, env, [datum]))[0],
						),
					})),
				);

				const length = this.settings.bucketSize
					? this.settings.bucketSize
					: this.settings.bucketsCount
						? Math.ceil(compare.length / this.settings.bucketsCount)
						: 1;

				await Promise.all(
					compare
						.sort(sorter)
						.map((r, i) =>
							r.datum.setValue(this.name, Math.floor(i / length)),
						),
				);
			}),
		);

		return <Promise<number[]>>(
			Promise.all(datums.map((d) => d.getValue(this.name, () => null)))
		);
	}
}
