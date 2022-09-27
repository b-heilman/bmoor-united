import {ContextSecurityInterface} from '@bmoor/context';

import {ModelFieldInterface} from './model/field.interface';
import {ModelFieldSet} from './model/field/set';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type InternalDatum = any;
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ExternalDatum = any;
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type SearchDatum = any;

export interface ModelController<External> {
	// securing data that has been requested
	canRead(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	// securing data that has been submitted
	canCreate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	canUpdate(
		datums: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
}

export interface ModelAdapter<Internal> {
	create(content: Internal[]): Promise<Internal[]>;
	read(ids: string[]): Promise<Internal[]>;
	update(
		content: Record<string, Internal>
	): Promise<Record<string, Internal>>;
	delete?(content: Internal[]): Promise<Internal[]>;
	search?(search: SearchDatum): Promise<Internal[]>;
}

export interface ModelSettings<External, Internal> {
	adapter: ModelAdapter<Internal>;
	controller: ModelController<External>;
	fields: ModelFieldSet;
}

export interface ModelInterface<External, Internal> {
	fields: Map<string, ModelFieldInterface>;

	create(
		content: External[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
	read(ids: string[], ctx: ContextSecurityInterface): Promise<External[]>;
	update(
		content: Record<string, External>,
		ctx: ContextSecurityInterface
	): Promise<Record<string, External>>;
	delete(
		ids: string[],
		ctx: ContextSecurityInterface
	): Promise<External[]>;
	search(
		search: SearchDatum,
		ctx: ContextSecurityInterface
	): Promise<External[]>;

	getByPath(external: string);
	convertToInternal(content: External[]): Internal[];
	convertToExternal(content: Internal[]): External[];
}
