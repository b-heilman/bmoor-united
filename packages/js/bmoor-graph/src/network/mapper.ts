import {Hub} from './hub';

export class Mapper {
	hubs: Record<string, Hub>;
	constructor() {
		this.clear();
	}

	clear() {
		this.hubs = {};
	}

	addModel(model) {
		const fields = model.incomingSettings.fields;

		for (const property in fields) {
			const field = fields[property];

			if (field.link) {
				this.addLink(
					model.name,
					property,
					field.link.name,
					field.link.field,
				);
			}
		}
	}

	addLink(fromTable, fromPath, toTable, toPath) {
		const from =
			this.hubs[fromTable] || (this.hubs[fromTable] = new Hub(fromTable));

		from.addLink({
			from: fromTable,
			fromPath,
			to: toTable,
			toPath,
			metadata: {
				direction: 'outgoing',
			},
		});

		const to =
			this.hubs[toTable] || (this.hubs[toTable] = new Hub(toTable));

		to.addLink({
			from: toTable,
			fromPath: toPath,
			to: fromTable,
			toPath: fromPath,
			metadata: {
				direction: 'incoming',
			},
		});
	}

	getHub(name): Hub {
		return this.hubs[name];
	}

	getByDirection(name, direction) {
		return this.hubs[name].connections.filter(
			(d) => d.metadata.direction === direction,
		);
	}

	getRelationships(fromName) {
		const hub = this.getHub(fromName);

		if (hub) {
			return hub.connections;
		}

		return null;
	}

	getRelationship(fromName, toName, fromField = null, toField = null) {
		const hub = this.getHub(fromName);

		if (hub) {
			return hub.getLink(toName, fromField, toField);
		}

		return null;
	}
}
