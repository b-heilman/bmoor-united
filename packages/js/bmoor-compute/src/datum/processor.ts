import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAction} from './action';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';

export class DatumProcessor<ResponseT, EnvT, RequirementT>
	implements DatumActionInterface<ResponseT, EnvT>
{
	name: string;
	action: DatumAction<RequirementT, EnvT>;
	reducer: (args: RequirementT) => ResponseT;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, EnvT>,
		reducer: (args: RequirementT) => ResponseT,
	) {
		this.name;
		this.action = new DatumAction(name, requirements);
		this.reducer = reducer;
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: IDatum[],
	): Promise<ResponseT[]> {
		const res = await this.action.process(ctx, env, datums);

		return res.map((res) => this.reducer(res));
	}
}
