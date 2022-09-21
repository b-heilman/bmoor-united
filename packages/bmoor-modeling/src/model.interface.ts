import {ContextSecurityInterface} from '@bmoor/context';

import {ModelFieldInterface} from './model/field.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalDatum = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalDatum = any;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type SearchDatum = any;

export interface ModelSecurity {
	// securing data that has been requested
	secure(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[];

	// securing data that has been submitted
	validateCreate(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[];

	validateUpdate(
		datums: ExternalDatum[],
		ctx: ContextSecurityInterface
	): ExternalDatum[];
}

export interface ModelAccessors {
	create(content: InternalDatum[]): Promise<InternalDatum[]>;
	read(ids: string[]): Promise<InternalDatum[]>;
	update(content: Record<string, InternalDatum>): Promise<Record<string, InternalDatum>>;
	delete(content: InternalDatum[]):  Promise<InternalDatum[]>;
	search(search: SearchDatum):  Promise<InternalDatum[]>;
}

export interface ModelSettings {
	security: ModelSecurity;
	accessors: ModelAccessors;
	fields: ModelFieldInterface[];
}

export interface ModelInterface {
	fields: Map<string, ModelFieldInterface>;

	create(
		content: ExternalDatum[],
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]>;
	read(
		ids: string[], 
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]>;
	update(
		content: Record<string, ExternalDatum>,
		ctx: ContextSecurityInterface
	): Promise<Record<string, ExternalDatum>>;
	delete(
		ids: string[], 
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]>;
	search(
		search: SearchDatum, 
		ctx: ContextSecurityInterface
	): Promise<ExternalDatum[]>;

	getByPath(external: string);
	convertToInternal(content: ExternalDatum[]): InternalDatum[];
	convertToExternal(content: InternalDatum[]): ExternalDatum[];
}
