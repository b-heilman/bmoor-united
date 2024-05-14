import {Context} from '@bmoor/context';

import {IDatum} from '../datum.interface';

export interface DatumActionInterface<ResponseT, EnvT> {
	name: string;
	process(ctx: Context, env: EnvT, datums: IDatum[]): Promise<ResponseT[]>;
}

export type DatumActionRequirements<RequirementT, ContextT> = {
	[Property in keyof RequirementT]:
		| DatumActionInterface<RequirementT[Property], ContextT>
		| string;
};
