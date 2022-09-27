export interface ModelFieldDisplay {
	title: string;
	description: string;
}

export interface ModelFieldSettings {
	external: string;
	internal?: string;
	usage?: string;
	jsonType?: string;
	display?: ModelFieldDisplay;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ModelDatum = any;
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type FieldValue = any;

export type FieldSetter = (datum: ModelDatum, value: FieldValue) => void;
export type FieldGetter = (datum: ModelDatum) => FieldValue;

export type FieldConfig = {
	getTarget?(datum: ModelDatum): FieldValue;
};

export type ModelFieldUsage = {
	onInflate?(
		datum: ModelDatum,
		setter: FieldSetter,
		getter?: FieldGetter,
		cfg?: FieldConfig
	): void;
	onDeflate?(
		datum: ModelDatum,
		setter: FieldSetter,
		getter: FieldGetter,
		cfg: FieldConfig
	): void;
	onCreate?(
		datum: ModelDatum,
		setter: FieldSetter,
		getter: FieldGetter,
		cfg: FieldConfig
	): void;
	onRead?(
		datum: ModelDatum,
		setter: FieldSetter,
		getter: FieldGetter,
		cfg: FieldConfig
	): void;
	onUpdate?(
		datum: ModelDatum,
		setter: FieldSetter,
		getter: FieldGetter,
		cfg: FieldConfig
	): void;
	onDelete?(
		datum: ModelDatum,
		setter: FieldSetter,
		getter: FieldGetter,
		cfg: FieldConfig
	): void;
};

export type ModelFieldTypescript = {
	internal: {
		path: string;
		format: string;
	};
	external: {
		path: string;
		format: string;
	};
};

export interface ModelFieldInterface {
	incomingSettings: ModelFieldSettings;
	toTypescript(): ModelFieldTypescript;
}

export type ModelFieldSet = ModelFieldInterface[];
