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
	parentMetadata?: Record<string, string>;
}

export interface DatumSetterSettings {
	fake?: boolean;
}

export interface DatumInterface<SelectorT = DatumSelector> {
	getReference(): DatumReference;
	getParent(): DatumInterface<SelectorT>,
	getChildren(): Map<DatumReference, DatumInterface<SelectorT>>;

	// addChild(child: DatumInterface<SelectorT>);

	// get the value, could be an async source
	getValue(
		attr: FeatureReference,
		generator: () => Promise<FeatureValue>,
		settings?: DatumSetterSettings,
	): Promise<FeatureValue>;

	// set the value
	setValue(attr: FeatureReference, value: FeatureValue): Promise<boolean>;

	equals(other: DatumInterface<SelectorT>): boolean;

	select(selector: SelectorT): DatumInterface<SelectorT>[];
}
