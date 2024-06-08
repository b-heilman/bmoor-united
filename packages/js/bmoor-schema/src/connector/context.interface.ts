import {ConnectionFn, ConnectionReference} from '../connection.interface';
import {ContextInterface} from '../context.interface';
import {TypingJSON} from '../typing.interface';

export interface ConnectorContextInterface<
	T extends TypingJSON = TypingJSON,
> extends ContextInterface<T> {
	getConnection(ref: ConnectionReference): ConnectionFn;
}
