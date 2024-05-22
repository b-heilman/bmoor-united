import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface';
import {DatumAccessor} from './accessor';
import {DatumRankerContext, DatumRankerSettings} from './ranker.interface';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface';

export class DatumRanker<
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumRankerContext<DatumT, SelectT>,
> implements DatumReaderInterface<number, DatumT, EnvT>
{
	name: string;
	accessor: DatumAccessor<RequirementT, DatumT, EnvT>;
	settings: DatumRankerSettings<RequirementT, SelectT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumRankerSettings<RequirementT, SelectT>,
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
						value: this.settings.reducer(
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
