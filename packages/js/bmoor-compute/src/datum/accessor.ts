import { DatumAccessorSettings, DatumAccessorContext } from "./accessor.interface";
import { DatumAction } from './action';
import { DatumActionRequirements } from "./action.interface";
import { IDatum, FeatureReference } from "../datum.interface";

/***
 * Allows you to run a action against a datum, but it is offset from 0
 */
export class DatumAccessor<
	RequirementT,
	ContextT extends DatumAccessorContext
> extends DatumAction<RequirementT, ContextT> {
	settings: DatumAccessorSettings

	// This should calculate the offset defined... somewhere?
	constructor(
		name: FeatureReference,
        requirements: DatumActionRequirements<RequirementT, ContextT>,
		settings: DatumAccessorSettings
	){
		super(name, requirements);

		this.settings = settings;
	}

	select(ctx: ContextT, datums: IDatum[]): IDatum[] {
		return datums.map(datum => {
			return ctx.offset(datum, this.settings.offset, !!this.settings.strict);
		});
	}

	async process(ctx: ContextT, reference: FeatureReference, datums: IDatum[]): Promise<RequirementT[]> {
		return super.process(ctx, reference, this.select(ctx, datums));
	}
}
