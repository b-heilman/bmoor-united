export type DatumReference = string;

export type FeatureReference = string;

export type FeatureValue = number | boolean;

export interface DatumSettings {
	features: Record<string, number>;
	metadata?: Record<string, string>;
	children?: Record<string, DatumSettings>;
}

export interface DatumSelector {
	metadata?: Record<string, string>;
	parent?: Record<string, string>;
}

export interface IDatum {
	hasValue(attr: FeatureReference): boolean;

	// get the value, could be an async source
	getValue(
		attr: FeatureReference,
		generator: () => Promise<FeatureValue>,
	): Promise<FeatureValue>;

	// set the value
	setValue(attr: FeatureReference, value: FeatureValue): Promise<boolean>;

	equals(other: IDatum): boolean;
}

export interface DatumInterface extends IDatum {
	ref: DatumReference;
	children: Map<DatumReference, DatumInterface>;

	select(selector: DatumSelector): DatumInterface[];
	addChild(child: DatumInterface);
}
