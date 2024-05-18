import {Context} from '@bmoor/context';

import {IDatum} from '../datum.interface';

export interface DatumActionInterface<
	ResponseT,
	DatumT extends IDatum,
	EnvT,
> {
	name: string;
	process(ctx: Context, env: EnvT, datums: DatumT[]): Promise<ResponseT[]>;
}

export type DatumActionRequirements<
	RequirementT,
	DatumT extends IDatum,
	ContextT,
> = {
	[Property in keyof RequirementT]:
		| DatumActionInterface<RequirementT[Property], DatumT, ContextT>
		| string;
};
