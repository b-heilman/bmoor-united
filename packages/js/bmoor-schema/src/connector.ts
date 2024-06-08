import {ConnectionFn, ConnectionReference} from './connection.interface';
import {ConnectorInterface} from './connector.interface';

export class Connector implements ConnectorInterface {
	index: Record<ConnectionReference, ConnectionFn>;

	constructor(index: Record<ConnectionReference, ConnectionFn> = {}) {
		this.index = index;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<ConnectionReference, ConnectionFn>) {
		this.index = {...this.index, ...types};
	}

	addConnection(type: ConnectionReference, info: ConnectionFn) {
		this.index[type] = info;
	}

	getConnection(type: ConnectionReference): ConnectionFn {
		return this.index[type];
	}
}

export const validations = new Connector({
	stub: async () => [{foo: 'bar'}],
});
