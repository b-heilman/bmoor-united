import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface';
import {DatumProcessorSettings} from './processor.interface';
import {DatumReader} from './reader';
import {
	DatumReaderInterface,
	DatumReaderRequirements,
} from './reader.interface';

export class DatumProcessor<
	ResponseT,
	RequirementT,
	DatumT extends DatumInterface,
	EnvT,
> implements DatumReaderInterface<ResponseT, DatumT, EnvT>
{
	name: string;
	action: DatumReader<RequirementT, DatumT, EnvT>;
	settings: DatumProcessorSettings<ResponseT, RequirementT>;

	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumProcessorSettings<ResponseT, RequirementT>,
	) {
		this.name = name;
		this.action = new DatumReader(name, requirements);
		this.settings = settings;
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: DatumInterface[],
	): Promise<ResponseT[]> {
		const res = await this.action.process(ctx, env, datums);

		return res.map((res) => this.settings.reducer(res));
	}
}
