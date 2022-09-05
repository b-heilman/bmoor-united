import {ContextSecurityInterface} from '@bmoor/context';

import {SecurityInterface, SecuritySettings} from './security.interface';
import {ModelFieldInterface} from './model/field.interface';
import {InternalDatum, SearchDatum, ExternalDatum} from './datum.interface';

export interface ModelAccessorsInterface {
	create(content: InternalDatum[]): InternalDatum[];
	read(ids: string[]): InternalDatum[];
	update(content: Record<string, InternalDatum>): Record<string, InternalDatum>;
	delete(content: InternalDatum[]): InternalDatum[];
	search(search: SearchDatum): InternalDatum[];
}

export interface ModelSettings {
	security: SecurityInterface;
	accessors: ModelAccessorsInterface;
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
