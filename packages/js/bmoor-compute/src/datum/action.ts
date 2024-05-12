import {IDatum, FeatureReference} from '../datum.interface';
import { DatumActionInterface, DatumActionRequirements } from './action.interface';

/***
 * Allows you to variable from a datum and load in requirements
 */
export class DatumAction<RequirementT, ContextT> 
    implements DatumActionInterface<RequirementT, ContextT>{
    name: FeatureReference;
	requirements: DatumActionRequirements<RequirementT, ContextT>

    constructor(
        name: FeatureReference,
        requirements: DatumActionRequirements<RequirementT, ContextT>
        
    ){
        this.name = name;
        this.requirements = requirements;
    }

    process(ctx: ContextT, datums: IDatum[]): Promise<RequirementT[]> {
        return Promise.all(
            datums.map(async (datum) => {
                // load requirements
                const keys = Object.keys(this.requirements);
                const reqs = keys.map(
                    (key) => {
                        const req = this.requirements[key];

                        if (req instanceof DatumAction){
                            return datum.getValue(
                                req.name, 
                                async () => (await req.process(ctx, [datum]))[0]
                            );
                        } else {
                            return datum.getValue(req, () => null)
                        }
                    }
                );

                return <RequirementT>(await Promise.all(reqs)).reduce(
                    (agg, value, i) => {
                        agg[keys[i]] = value

                        return agg;
                    },
                    {}
                );
            })
        );
    }
}