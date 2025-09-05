import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface.ts';
import {DatumOffset} from './offset.ts';
import {
	DatumRankerContext,
	DatumRankerSettings,
} from './ranker.interface.ts';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface.ts';

export class DatumRanker<
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumRankerContext<DatumT, SelectT>,
> implements DatumReaderInterface<number, DatumT, EnvT>
{
	name: string;
	accessor: DatumOffset<RequirementT, DatumT, SelectT, EnvT>;
	settings: DatumRankerSettings<RequirementT, SelectT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumRankerSettings<RequirementT, SelectT>,
	) {
		this.name = name;
		this.accessor = new DatumOffset<RequirementT, DatumT, SelectT, EnvT>(
			name,
			requirements,
			Object.assign({}, settings, {select: null}),
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

		const rtn = await Promise.all(
			datums.map((d) => d.getValue(this.name, () => null)),
		);

		return <number[]>rtn;
	}
}
