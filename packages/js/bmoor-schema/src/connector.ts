import {
	ConnectorFn,
	ConnectorInterface,
	ConnectorReference,
} from './connector.interface';

export class Connector implements ConnectorInterface {
	index: Record<ConnectorReference, ConnectorFn>;

	constructor(types: Record<ConnectorReference, ConnectorFn> = {}) {
		this.index = types;
	}

	clear() {
		this.index = {};
	}

	define(types: Record<ConnectorReference, ConnectorFn>) {
		this.index = {...this.index, ...types};
	}

	addConnection(type: ConnectorReference, info: ConnectorFn) {
		this.index[type] = info;
	}

	getConnection(type: ConnectorReference): ConnectorFn {
		return this.index[type];
	}
}

export const validations = new Connector({
	stub: async () => [{foo: 'bar'}],
});
