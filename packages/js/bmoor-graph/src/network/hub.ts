import {makeGetter} from '@bmoor/object';

import { HubLink } from './hub.interface';

export class Hub {
	ref: string;
	connections: HubLink[]
	connectors: Record<string, HubLink[]>

	constructor(ref: string) {
		this.ref = ref;
		this.connections = []; // aggregrate of ALL links, even multiple links to one table
		this.connectors = {}; // quick look hash, at least one instance is there, but not all if
		// multiple fields
	}

	// joins
	reduceConnections() {
		return this.connections;
	}

	// hash
	reduceConnectors() {
		return this.connectors;
	}

	addLink(connection: HubLink) {
		if (connection.from !== this.ref){
			throw new Error(
				`adding connection from that does not match ref: ${connection.from} vs ${this.ref}` 
			)
		}

		const existing = this.connectors[connection.to];

		if (!existing) {
			this.connectors[connection.to] = [];
		}

		this.connectors[connection.to].push(connection);
		this.connections.push(connection);
	}

	prune(subset): HubLink[] {
		return subset.reduce((agg, name) => {
			const subConnections = this.connectors[name];

			if (subConnections) {
				return agg.concat(subConnections);
			} else {
				return agg;
			}
		}, []);
	}

	getLinks(path, value, subset): HubLink[] {
		const getter = makeGetter(path);

		const connections = subset ? this.prune(subset) : this.connections;

		return connections.filter(
			(connection) => getter(connection.metadata) === value
		);
	}

	search(path, value, subset): string[] {
		return this.getLinks(path, value, subset).map((join) => join.to);
	}

	isLinked(name) {
		return !!this.connectors[name];
	}

	linksThrough(name): string[] {
		const connector = this.connectors[name];

		if (connector) {
			return connector.map((link) => link.fromPath);
		} else {
			return null;
		}
	}

	getLink(name, viaField = null, toField = null): HubLink {
		const connector = this.connectors[name];

		if (connector) {
			if (viaField) {
				return connector.reduce((agg, link) => {
					if (agg) {
						return agg;
					}

					if (link.fromPath === viaField) {
						if (!toField || link.toPath === toField) {
							return link;
						}
					}

					return agg;
				}, null);
			} else {
				return connector[0];
			}
		} else {
			return null;
		}
	}
}
