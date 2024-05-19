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
	DatumT extends IDatum,
	EnvT extends DatumAccessorContext<DatumT>,
> extends DatumAction<RequirementT, DatumT, EnvT> {
	settings: DatumAccessorSettings;

	// This should calculate the offset defined... somewhere?
	constructor(
		name: FeatureReference,
		requirements: DatumActionRequirements<RequirementT, DatumT, EnvT>,
		settings: DatumAccessorSettings,
	) {
		super(name, requirements);

		this.settings = settings;
	}

	select(ctx: EnvT, datums: DatumT[]): DatumT[] {
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
		datums: DatumT[],
	): Promise<RequirementT[]> {
		const newDatums = this.select(env, datums);
		return super.process(ctx, env, newDatums);
	}
}
