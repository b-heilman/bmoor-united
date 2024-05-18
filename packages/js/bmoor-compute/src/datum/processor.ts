import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {DatumAction} from './action';
import {
	DatumActionInterface,
	DatumActionRequirements,
} from './action.interface';

export class DatumProcessor<
	ResponseT,
	DatumT extends IDatum,
	EnvT,
	RequirementT,
> implements DatumActionInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	action: DatumAction<RequirementT, DatumT, EnvT>;
	reducer: (args: RequirementT) => ResponseT;

	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
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
