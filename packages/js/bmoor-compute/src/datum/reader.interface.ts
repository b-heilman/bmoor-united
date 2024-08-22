import {Context} from '@bmoor/context';

import {DatumInterface} from '../datum.interface';

export interface DatumReaderInterface<
	ResponseT,
	DatumT extends DatumInterface,
	EnvT,
> {
	name: string;
	process(ctx: Context, env: EnvT, datums: DatumT[]): Promise<ResponseT[]>;
}

export type DatumReaderRequirements<
	RequirementT,
	DatumT extends DatumInterface,
	ContextT,
> = {
	[Property in keyof RequirementT]:
		| DatumReaderInterface<RequirementT[Property], DatumT, ContextT>
		| string;
};
