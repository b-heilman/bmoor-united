import {IDatum} from '../datum.interface';

export interface DatumActionInterface<ResponseT, ContextT> {
    process(ctx: ContextT, datums: IDatum[]): Promise<ResponseT[]>
}

export type DatumActionRequirements<RequirementT, ContextT> = {
    [Property in keyof RequirementT]: DatumActionInterface<RequirementT[Property], ContextT> | string
}