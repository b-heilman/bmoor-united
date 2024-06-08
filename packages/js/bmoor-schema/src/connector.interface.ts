import {ConnectorContextInterface} from './connector/context.interface';
import {TypingReference} from './typing.interface';

export type ConnectorActionsType = Record<string, TypingReference>;

export type ConnectorReference = string;

export interface ConnectorSelect<ActionsT extends ConnectorActionsType> {
	actions: ActionsT;
}

export type ConnectorFn<ActionsT extends ConnectorActionsType> = (
	select: ConnectorSelect<ActionsT>,
) => Promise<any[]>; // eslint-disable-line  @typescript-eslint/no-explicit-any

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export interface ConnectorJSON<ActionsT extends ConnectorActionsType> {
	connector: ConnectorReference;
	actions?: ActionsT;
}

export interface ConnectorReadable<ActionsT extends ConnectorActionsType> {
	read(
		ctx: ConnectorContextInterface<ActionsT>,
		select: ConnectorSelect<ActionsT>,
	): Promise<any[]>; // eslint-disable-line  @typescript-eslint/no-explicit-any
}

export interface ConnectorInterface<
	ActionsT extends ConnectorActionsType,
> {
	define(types: Record<ConnectorReference, ConnectorFn<ActionsT>>);
	addConnection(
		type: ConnectorReference,
		info: ConnectorFn<ActionsT>,
	): void;
	getConnection(type: ConnectorReference): ConnectorFn<ActionsT>;
}
