import {Context} from '@bmoor/context';

import {FeatureReference, IDatum} from '../datum.interface';
import {
	DatumAccessorContext,
	DatumAccessorSettings,
} from './accessor.interface';
import {DatumAction} from './action';
import {DatumActionRequirements} from './action.interface';

/***
 * Allows you to run a action against a datum, but it is offset from 0
 */
export class DatumAccessor<
	RequirementT,
	EnvT extends DatumAccessorContext,
> extends DatumAction<RequirementT, EnvT> {
	settings: DatumAccessorSettings;

	// This should calculate the offset defined... somewhere?
	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, EnvT>,
		settings: DatumAccessorSettings,
	) {
		super(name, requirements);

		this.settings = settings;
	}

	select(ctx: EnvT, datums: IDatum[]): IDatum[] {
		return datums.map((datum) => {
			return ctx.offset(
				datum,
				this.settings.offset,
				!!this.settings.strict,
			);
		});
	}

	async process(
		ctx: Context,
		env: EnvT,
		datums: IDatum[],
	): Promise<RequirementT[]> {
		return super.process(ctx, env, this.select(env, datums));
	}
}
