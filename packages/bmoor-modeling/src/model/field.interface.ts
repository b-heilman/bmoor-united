// TODO: does this really need to be here?
export interface ModelFieldDisplay {
	title: string;
	description: string;
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ModelDatum = any;
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ModelFieldValue = any;

export type ModelFieldSetter = (
	datum: ModelDatum,
	value: ModelFieldValue
) => void;
export type ModelFieldGetter = (datum: ModelDatum) => ModelFieldValue;

export type ModelFieldUsage = {
	onInflate?(
		datum: ModelDatum,
		setter: ModelFieldSetter,
		getter?: ModelFieldGetter,
		ctx?: ModelFieldContext
	): void;
	onDeflate?(
		datum: ModelDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx: ModelFieldContext
	): void;
	onCreate?(
		datum: ModelDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx: ModelFieldContext
	): void;
	onRead?(
		datum: ModelDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx: ModelFieldContext
	): void;
	onUpdate?(
		datum: ModelDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx: ModelFieldContext
	): void;
	onDelete?(
		datum: ModelDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx: ModelFieldContext
	): void;
};

export type ModelFieldConfig = {
	target: string;
};

export type ModelFieldContext = {
	getTarget?(datum: ModelDatum): ModelFieldValue;
};

export interface ModelFieldSettings extends ModelFieldUsage {
	external: string; // path to be positioned externall
	internal?: string; // path to be read from the source
	isFlat?: boolean; // is the storage flat or structured (sql vs doc)
	storage?: string; // path the written to the source
	usage?: string; // how is this field used?  Allows pre defined
	jsonType?: string;
	display?: ModelFieldDisplay; // display settings, if needed
	config?: ModelFieldConfig;
}

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
	settings: ModelFieldSettings;

	externalGetter: ModelFieldGetter;
	externalSetter: ModelFieldSetter;
	internalGetter: ModelFieldGetter;
	internalSetter: ModelFieldSetter;

	toTypescript(): ModelFieldTypescript;
}

export type ModelFieldSet = ModelFieldInterface[];
