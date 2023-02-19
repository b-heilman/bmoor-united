import {ContextSecurityInterface} from '@bmoor/context';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalDatum = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ModelFieldValue = any;

export type ModelFieldSetter = (
	datum: ExternalDatum,
	value: ModelFieldValue,
) => void;
export type ModelFieldGetter = (datum: ExternalDatum) => ModelFieldValue;

export interface ModelFieldUsage {
	jsonType?: string;
	forKey?: boolean;
	forCreate?: boolean;
	forUpdate?: boolean;
	forSearch?: boolean;
}

export type ModelFieldConfig = {
	target: string;
};

export type ModelFieldContext = {
	getTarget?(datum: ExternalDatum): ModelFieldValue;
};

export interface ModelFieldStructure {
	storage?: string; // path the written to the source
	external: string; // path to be positioned externall
	internal?: string; // path to be read from the source
	isFlat?: boolean; // is the storage flat or structured (sql vs doc)
	usage?: string; // how is this field used?  Allows pre defined
	config?: ModelFieldConfig;
}

export interface ModelFieldMethods {
	onInflate?(
		datum: ExternalDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx?: ContextSecurityInterface,
		fieldCtx?: ModelFieldContext,
	): void;
	onDeflate?(
		datum: ExternalDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx?: ContextSecurityInterface,
		fieldCtx?: ModelFieldContext,
	): void;
	onCreate?(
		datum: ExternalDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx?: ContextSecurityInterface,
		fieldCtx?: ModelFieldContext,
	): void;
	onRead?(
		datum: ExternalDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx?: ContextSecurityInterface,
		fieldCtx?: ModelFieldContext,
	): void;
	onUpdate?(
		datum: ExternalDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx?: ContextSecurityInterface,
		fieldCtx?: ModelFieldContext,
	): void;
	onDelete?(
		datum: ExternalDatum,
		setter: ModelFieldSetter,
		getter: ModelFieldGetter,
		ctx?: ContextSecurityInterface,
		fieldCtx?: ModelFieldContext,
	): void;
}

export interface ModelFieldSettings
	extends ModelFieldUsage,
		ModelFieldStructure,
		ModelFieldMethods {}

export type ModelFieldActions = {
	create?(
		datum: ExternalDatum,
		ctx?: ContextSecurityInterface,
	): ExternalDatum;
	read?(
		datum: ExternalDatum,
		ctx?: ContextSecurityInterface,
	): ExternalDatum;
	update?(
		datum: ExternalDatum,
		ctx?: ContextSecurityInterface,
	): ExternalDatum;
	delete?(
		datum: ExternalDatum,
		ctx?: ContextSecurityInterface,
	): ExternalDatum;
	inflate?(
		datum: ExternalDatum,
		ctx?: ContextSecurityInterface,
	): ExternalDatum;
	deflate?(
		datum: ExternalDatum,
		ctx?: ContextSecurityInterface,
	): ExternalDatum;
};

export type ModelFieldTypescriptInfo = {
	path: string;
	format: string;
};

export type TypescriptUsage = {
	read: ModelFieldTypescriptInfo;
	reference?: ModelFieldTypescriptInfo;
	create?: ModelFieldTypescriptInfo;
	update?: ModelFieldTypescriptInfo;
	search?: ModelFieldTypescriptInfo;
};

export type ModelFieldTypescript = {
	external: TypescriptUsage;
	internal: TypescriptUsage;
};

export interface ModelFieldInterface {
	settings: ModelFieldSettings;
	actions: ModelFieldActions;

	externalGetter: ModelFieldGetter;
	externalSetter: ModelFieldSetter;
	internalGetter: ModelFieldGetter;
	internalSetter: ModelFieldSetter;

	toTypescript(): ModelFieldTypescript;
}

export type ModelFieldSet = ModelFieldInterface[];
