export type FeatureReference = string;

export interface IDatum {
	hasValue(attr: FeatureReference): boolean;

	// get the value, could be an async source
	getValue(attr: FeatureReference): Promise<number>;

	// set the value
	setValue(attr: FeatureReference, value: number): Promise<boolean>;
}
