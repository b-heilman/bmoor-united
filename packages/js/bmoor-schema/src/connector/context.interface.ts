import {ConnectionFn, ConnectionReference} from '../connection.interface';
import {ContextInterface} from '../context.interface';
import {TypingJSON} from '../typing.interface';

export interface ConnectorContextInterface<
	TypingT extends TypingJSON = TypingJSON,
> extends ContextInterface<TypingT> {
	getConnection(ref: ConnectionReference): ConnectionFn;
}
