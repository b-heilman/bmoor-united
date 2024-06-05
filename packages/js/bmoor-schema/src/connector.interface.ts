import {ContextInterface} from './context.interface';

export type ConnectorReference = string;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type ConnectorFn = (select: any) => Promise<any[]>;

export interface ConnectorJSON {
	connector: ConnectorReference;
}

export interface ConnectorReadable {
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	read(ctx: ContextInterface, select: any): Promise<any[]>;
}

export interface ConnectorInterface {
	define(types: Record<ConnectorReference, ConnectorFn>);
	addConnection(type: ConnectorReference, info: ConnectorFn): void;
	getConnection(type: ConnectorReference): ConnectorFn;
}
