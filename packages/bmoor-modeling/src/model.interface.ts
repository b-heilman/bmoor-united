import {ContextSecurityInterface} from '@bmoor/context';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type RawDatum = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ModelDatum = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type SearchDatum = any;

export interface ModelSecurity {
	secure(datums: ModelDatum[], ctx: ContextSecurityInterface);
	validate(datums: ModelDatum[], ctx: ContextSecurityInterface);
}

export interface ModelAccessors {
	create(content: RawDatum[]): RawDatum[];
	read(ids: string[]): RawDatum[];
	update(content: {string: RawDatum}): {string: RawDatum};
	delete(ids: string[]): RawDatum[];
	search(search: SearchDatum): RawDatum[];
}

export interface ModelFieldDisplay {
	title: string;
	description: string;
}

export interface ModelFieldSettings {
	internal: string;
	external: string;
	type?: string;
	jsonType?: string;
	display: ModelFieldDisplay;
}

export interface ModelSettings {
	security: ModelSecurity;
	accessors: ModelAccessors;
	fields: ModelFieldSettings[];
}

export interface ModelInterface {
	create(content: ModelDatum[], ctx: ContextSecurityInterface): ModelDatum[];
	read(ids: string[], ctx: ContextSecurityInterface): ModelDatum[];
	update(
		content: {string: ModelDatum},
		ctx: ContextSecurityInterface
	): {string: ModelDatum};
	delete(ids: string[], ctx: ContextSecurityInterface): ModelDatum[];
	search(search: SearchDatum, ctx: ContextSecurityInterface): ModelDatum[];

	getByPath(external: string);
}
