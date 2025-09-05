import {Context} from '@bmoor/context';

import {DatumInterface, FeatureReference} from '../datum.interface.ts';
import {
	DatumOffsetContext,
	DatumOffsetSettings,
} from './offset.interface.ts';
import {DatumReaderRequirements} from './reader.interface.ts';
import {DatumReader} from './reader.ts';

/***
 * Allows you to run a action against a datum, but it is offset from 0
 */
export class DatumOffset<
	RequirementT,
	DatumT extends DatumInterface,
	SelectT,
	EnvT extends DatumOffsetContext<DatumT, SelectT>,
> extends DatumReader<RequirementT, DatumT, EnvT> {
	settings: DatumOffsetSettings<SelectT>;

	// Select values, offset from a datum.  Offset can be by an interval or
	// by position, or both
	constructor(
		name: FeatureReference,
		requirements: DatumReaderRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumOffsetSettings<SelectT>,
	) {
		super(name, requirements);

		this.settings = settings;
	}

	select(ctx: EnvT, datums: DatumT[]): DatumT[] {
		// The role of select here is to select above or related, but
		// only translate one node to another.
		if (this.settings.select) {
			datums = datums.map((datum) => {
				const res = ctx.select(
					datum,
					Object.assign({}, this.settings.select),
				);

				if (res.length > 1) {
					throw new Error(
						`Matching multiple offset: ${datum.getReference()} with ${JSON.stringify(this.settings.select)}`,
					);
				}

				return res[0];
			});
		}

		if (this.settings.offset) {
			datums = datums.map((datum) => {
				return ctx.offset(
					datum,
					this.settings.offset,
					!!this.settings.strict,
				);
			});
		}

		return datums;
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: DatumT[],
	): Promise<RequirementT[]> {
		return super.process(ctx, env, this.select(env, datums));
	}
}
