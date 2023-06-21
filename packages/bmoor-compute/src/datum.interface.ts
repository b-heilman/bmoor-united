export type DatumReference = string;

export type FeatureReference = string;

export interface DatumInterface<Interval> {
	ref?: DatumReference;
	interval: Interval;

	hasValue(attr: FeatureReference): boolean;

	// get the value, could be an async source
	getValue(attr: FeatureReference): Promise<number>;

	// set the value
	setValue(attr: FeatureReference, value: number): Promise<boolean>;
}
