import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';

/***
 * Allows you to variable from a datum and load in requirements
 */
export class DatumAction<RequirementT, DatumT extends IDatum, EnvT>
	implements DatumActionInterface<RequirementT, DatumT, EnvT>
{
	name: FeatureReference;
	requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
	) {
		this.name = name;
		this.requirements = requirements;
	}

	process(
		ctx: Context,
		env: EnvT,
		datums: IDatum[],
	): Promise<RequirementT[]> {
		return Promise.all(
			datums.map(async (datum) => {
				// load requirements
				const keys = Object.keys(this.requirements);
				const reqs = keys.map((key) => {
					const req = this.requirements[key];

					if (req instanceof DatumAction) {
						return datum.getValue(
							req.name,
							async () => (await req.process(ctx, env, [datum]))[0],
						);
					} else {
						return datum.getValue(req, () => null);
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
