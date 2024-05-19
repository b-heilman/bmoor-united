export interface DatumProcessorSettings<RequirementT, ResponseT> {
    reducer: (args: RequirementT) => ResponseT
}