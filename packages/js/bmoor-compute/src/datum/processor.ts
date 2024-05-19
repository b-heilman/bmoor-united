import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAction} from './action';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';
import { DatumProcessorSettings } from './processor.interface';

export class DatumProcessor<
	ResponseT,
	RequirementT,
	DatumT extends IDatum,
	EnvT,
> implements DatumActionInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	action: DatumAction<RequirementT, DatumT, EnvT>;
	settings: DatumProcessorSettings<ResponseT, RequirementT>;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumProcessorSettings<ResponseT, RequirementT>
	) {
		this.name = name;
		this.action = new DatumAction(name, requirements);
		this.settings = settings;
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: IDatum[],
	): Promise<ResponseT[]> {
		const res = await this.action.process(ctx, env, datums);

		return res.map((res) => this.settings.reducer(res));
	}
}
