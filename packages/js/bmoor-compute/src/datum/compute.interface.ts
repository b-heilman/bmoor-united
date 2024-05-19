import { DatumAccessorSettings } from "./accessor.interface";

export interface DatumComputeSettings<RequirementT, ResponseT> extends DatumAccessorSettings {
    reducer: (args: RequirementT) => ResponseT
}