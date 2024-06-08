import {
	ConnectorActionsType,
	ConnectorFn,
	ConnectorReference,
} from '../connector.interface';
import {ContextInterface} from '../context.interface';
import {TypingJSON} from '../typing.interface';

export interface ConnectorContextInterface<
	ActionsT extends ConnectorActionsType,
	T extends TypingJSON = TypingJSON,
> extends ContextInterface<T> {
	getConnector(ref: ConnectorReference): ConnectorFn<ActionsT>;
}
