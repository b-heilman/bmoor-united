import {
	ConnectionActionsType,
	ConnectionFn,
	ConnectionReference,
	ConnectionSelect,
} from './connection.interface';
import {ConnectorContextInterface} from './connector/context.interface';

export interface ConnectorReadable<
	ActionsT extends ConnectionActionsType,
> {
	read(
		ctx: ConnectorContextInterface,
		select: ConnectionSelect<ActionsT>,
	): Promise<any[]>; // eslint-disable-line  @typescript-eslint/no-explicit-any
}

export interface ConnectorInterface {
	define(types: Record<ConnectionReference, ConnectionFn>);
	addConnection(type: ConnectionReference, info: ConnectionFn): void;
	getConnection(type: ConnectionReference): ConnectionFn;
}
