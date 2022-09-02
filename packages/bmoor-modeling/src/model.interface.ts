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
	create(content: InternalDatum[]): InternalDatum[];
	read(ids: string[]): InternalDatum[];
	update(content: Record<string, InternalDatum>): Record<string, InternalDatum>;
	delete(content: InternalDatum[]): InternalDatum[];
	search(search: SearchDatum): InternalDatum[];
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
	): ExternalDatum[];
	read(ids: string[], ctx: ContextSecurityInterface): ExternalDatum[];
	update(
		content: Record<string, ExternalDatum>,
		ctx: ContextSecurityInterface
	): Record<string, ExternalDatum>;
	delete(ids: string[], ctx: ContextSecurityInterface): ExternalDatum[];
	search(search: SearchDatum, ctx: ContextSecurityInterface): ExternalDatum[];

	getByPath(external: string);
	convertToInternal(content: ExternalDatum[]): InternalDatum[];
	convertToExternal(content: InternalDatum[]): ExternalDatum[];
}
