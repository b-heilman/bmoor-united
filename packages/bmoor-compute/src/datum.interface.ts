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

export interface DatumAccessor {
	hasValue(attr: FeatureReference): boolean;

	// get the value, could be an async source
	getValue(attr: FeatureReference): Promise<FeatureValue>;

	awaitValue(
		attr: FeatureReference,
		prom: Promise<FeatureValue>,
	): Promise<boolean>;

	// set the value
	setValue(attr: FeatureReference, value: FeatureValue): Promise<boolean>;

	equals(other: DatumAccessor): boolean;
}

export interface DatumInterface<NodeSelector> extends DatumAccessor {
	ref?: DatumReference;

	select(select: NodeSelector): DatumInterface<NodeSelector>[];
}
