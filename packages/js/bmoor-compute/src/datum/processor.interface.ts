export interface DatumProcessorSettings<ResponseT, RequirementT> {
	reducer: (args: RequirementT) => ResponseT;
}
