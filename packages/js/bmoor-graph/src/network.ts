import {HubLink} from './network/hub.interface.js';
import {Hub} from './network/hub.js';
import {Linker} from './network/linker.js';
import {Mapper} from './network/mapper.js';

// Builds a network give a mapper
type NetworkSettings = {
	join?: Record<string, string[]>;
	stub?: string[];
};

export class Network {
	mapper: Mapper;

	constructor(mapper: Mapper) {
		this.mapper = mapper;
	}

	// given a set of targets, see if they all connect, limiting depth of search
	// this is pretty brute force
	search(
		toSearch: string[],
		depth = 999,
		settings: NetworkSettings = {},
	): Hub[] {
		const joinModels = Object.keys(settings.join || {}).reduce(
			(agg, model) => {
				const tables = settings.join[model];

				return tables.reduce((inner, table) => {
					let incoming = inner[table];

					if (!incoming) {
						incoming = {};

						inner[table] = incoming;
					}

					incoming[model] = true;

					return inner;
				}, agg);
			},
			{},
		);

		const stubModels = (settings.stub || []).reduce((agg, table) => {
			agg[table] = true;

			return agg;
		}, {});

		// reduce all names to the links for them
		let models: string[] = [...new Set(toSearch)]; // make unique

		if (models.length === 1) {
			// I feel a little dirty for this... but...
			return [this.mapper.getHub(models[0])];
		}

		let contains = models.reduce((agg, name) => {
			agg[name] = null;

			return agg;
		}, {});

		const masterModels = models;
		const fnFactory = (depthTarget) => {
			return (contains, name, i) => {
				const linker = new Linker(this.mapper, name);

				// if stubbed, no linking out
				if (stubModels[name]) {
					return contains;
				}

				// run only the following names, it's n!, but the ifs reduce n
				masterModels.slice(i + 1).forEach((nextName) => {
					const results = linker.search(nextName, depthTarget, {
						allowed: joinModels,
						block: Object.keys(stubModels),
					});

					if (results) {
						results.forEach((hub) => {
							if (name !== hub.ref) {
								contains[name] = linker.hub;

								if (!contains[hub.ref]) {
									contains[hub.ref] = hub;
								}
							}
						});
					}
				});

				return contains;
			};
		};

		const filterFn = (key) => !contains[key];

		for (let depthPos = 1; depthPos <= depth; depthPos++) {
			contains = models.reduce(fnFactory(depthPos), contains);

			if (Object.values(contains).indexOf(null) === -1) {
				depthPos = depth;
			}

			models = Object.keys(contains).filter(filterFn);
		}

		// Do a last can, make sure all links were defined... ensuring all
		// tables are linked
		return Object.keys(contains).map((key) => {
			const link = contains[key];

			if (!link) {
				throw new Error('unlinked target: ' + key);
			}

			return link;
		});
	}

	// orders links in a order the ensures requirements come first
	// TODO: need to abstract this function to a common directed graph sort
	requirements(toSearch, depth = 3): Hub[] {
		let hubs = this.search(toSearch, depth);

		if (hubs.length === 1) {
			return hubs;
		}

		const found = [];

		// keep rotating through the network, pulling off the edges
		// I can do this, because the base requirement will have none itself
		while (hubs.length) {
			const origLength = hubs.length;
			const names = hubs.map((hub) => hub.ref);

			hubs = hubs.filter((link) => {
				if (link.search('direction', 'outgoing', names).length === 0) {
					found.push(link);

					return false;
				} else {
					return true;
				}
			});

			if (hubs.length === origLength) {
				throw new Error('unable to reduce further');
			}
		}

		return found;
	}

	// orders with the most linked to node first, and then moves to the leaves
	anchored(toSearch, depth = 3): Hub[] {
		const hubs = this.search(toSearch, depth);

		if (hubs.length === 1) {
			return hubs;
		}

		const dex = hubs.reduce((agg, link) => {
			agg[link.ref] = link;

			return agg;
		}, {});
		const names = Object.keys(dex);

		const priority = hubs
			.map((hub) => ({
				hub,
				connections: hub.prune(names),
			}))
			.sort((a, b) => b.connections.length - a.connections.length); // I want higher counts first

		const name = priority.shift().hub.ref;
		const rtn: Hub[] = [dex[name]];
		const next: Hub[] = [dex[name]];

		delete dex[name];

		while (next.length) {
			const node = next.shift();
			const connections = node.prune(Object.keys(dex));

			connections.forEach((link) => {
				const needed = dex[link.to];
				if (needed) {
					rtn.push(needed);

					delete dex[link.to];

					next.push(needed);
				}
			});
		}

		return rtn;
	}

	path(fromName, toName, toSearch, depth = 3): Hub[] {
		const hubs = this.search(toSearch, depth);

		if (hubs.length === 1) {
			return hubs;
		}

		const dex: Record<string, {hub: Hub; links: HubLink[]}> = hubs.reduce(
			(agg, hub) => {
				agg[hub.ref] = {
					hub,
					links: [],
				};

				return agg;
			},
			{},
		);

		const names = Object.keys(dex);

		Object.values(dex).forEach((info) => {
			info.links = info.hub.prune(names);
		});

		const cur = dex[fromName];
		delete dex[fromName];

		if (fromName === toName) {
			return [cur.hub];
		}

		const search = [
			{
				node: cur,
				path: [cur.hub],
			},
		];

		while (search.length) {
			const {node, path} = search.shift();

			for (let i = 0; i < node.links.length; i++) {
				const link = node.links[i];
				const cur = dex[link.to];

				if (cur) {
					const slice = path.slice(0);

					slice.push(cur.hub);

					if (link.to === toName) {
						return slice;
					} else {
						delete dex[link.to];

						search.push({
							node: cur,
							path: slice,
						});
					}
				}
			}
		}

		return null;
	}

	branch(fromArr, toName, toSearch, depth = 3) {
		return [
			...new Set(
				fromArr
					.map((fromName) => this.path(fromName, toName, toSearch, depth))
					.flat(),
			),
		];
	}
}
