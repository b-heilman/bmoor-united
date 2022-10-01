import {ContextSecurityInterface} from '@bmoor/context';

import {ModelControllerInterface} from './model/controller.interface';
import {ValidatorInterface} from './model/validator.interface';
import {ModelFieldInterface} from './model/field.interface';
import {SearchDatum, ExternalDatum} from './datum.interface';
import {ModelFieldSet} from './model/field/set';

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
	controller: ModelControllerInterface<External>;
	validator?: ValidatorInterface<External>;
	fields: ModelFieldSet;
}

export type ModelActions = {
	create?(datum: ExternalDatum, ctx?: ContextSecurityInterface): void;
	read?(datum: ExternalDatum, ctx?: ContextSecurityInterface): void;
	update?(datum: ExternalDatum, ctx?: ContextSecurityInterface): void;
	delete?(datum: ExternalDatum, ctx?: ContextSecurityInterface): void;
	inflate?(datum: ExternalDatum, ctx?: ContextSecurityInterface): void;
	deflate?(datum: ExternalDatum, ctx?: ContextSecurityInterface): void;
};

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
