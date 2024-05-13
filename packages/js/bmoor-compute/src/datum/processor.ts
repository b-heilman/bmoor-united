import {Context} from '@bmoor/context';

import {DatumAction} from './action';
import {IDatum, FeatureReference} from '../datum.interface';
import { DatumActionInterface, DatumActionRequirements } from './action.interface';

export class DatumProcessor<
	ResponseT, ContextT, RequirementT
> implements DatumActionInterface<ResponseT, ContextT>
{
	action: DatumAction<RequirementT, ContextT>;
	reducer: (args: RequirementT) => ResponseT;

	constructor(
        name: FeatureReference,
        requirements: DatumActionRequirements<RequirementT, ContextT>,
        reducer: (args: RequirementT) => ResponseT
    ){
		this.action = new DatumAction(name, requirements);
		this.reducer = reducer;
    }

	async process(ctx: ContextT, reference: FeatureReference, datums: IDatum[]): Promise<ResponseT[]> {
		const res = await this.action.process(ctx, reference, datums);

		return res.map(res => this.reducer(res));
	}
}
