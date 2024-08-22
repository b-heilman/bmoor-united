import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface';

/***
 * Allows you to variable from a datum and load in requirements
 */
export class DatumReader<RequirementT, DatumT extends DatumInterface, EnvT>
	implements DatumReaderInterface<RequirementT, DatumT, EnvT>
{
	name: FeatureReference;
	requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
	) {
		this.name = name;
		this.requirements = requirements;
	}

	process(
		ctx: Context,
		env: EnvT,
		datums: DatumInterface[],
	): Promise<RequirementT[]> {
		return Promise.all(
			datums.map(async (datum) => {
				// load requirements
				const keys = Object.keys(this.requirements);
				const reqs = keys.map((key) => {
					const req = this.requirements[key];

					if (typeof req === 'string') {
						return datum.getValue(req);
					} else {
						return datum.getValue(
							req.name,
							async () => (await req.process(ctx, env, [datum]))[0],
						);
					}
				});

				return <RequirementT>(await Promise.all(reqs)).reduce(
					(agg, value, i) => {
						agg[keys[i]] = value;

						return agg;
					},
					{},
				);
			}),
		);
	}
}
