import {Hub} from './hub';
import {HubLink} from './hub.interface';
import {Mapper} from './mapper';

type LinkCheck = {
	count: number;
	hub: Hub;
	parent?: LinkCheck;
};

type LinkerSearchSettings = {
	allowed?: Record<string, Record<string, boolean>>;
	block?: string[];
};

// search a map for connective nodes, do it x deep
export class Linker {
	hub: Hub;
	mapper: Mapper;

	constructor(mapper: Mapper, name) {
		this.mapper = mapper;
		this.hub = mapper.getHub(name);

		if (!this.hub) {
			throw new Error('LINKER_FAIL: ' + name);
		}
	}

	// search for tables within x jumps
	// TODO: need to define settings
	search(toName, count = 999, settings: LinkerSearchSettings = {}): Hub[] {
		const connection = this.hub.getLink(toName);

		if (connection) {
			return [this.hub, this.mapper.getHub(toName)];
		} else if (count === 1) {
			// you can make one jump and no direct connection
			return [];
		}

		let rtn = null;

		const toCheck: LinkCheck[] = [];
		const traversed = {};
		const allowed = settings.allowed || {};
		const block = (settings.block || []).reduce((agg, name) => {
			agg[name] = true;

			return agg;
		}, {});

		// create initial search list
		this.hub.connections.forEach((link: HubLink) => {
			const hub = this.mapper.getHub(link.to);

			if (
				!block[hub.ref] &&
				(!allowed[hub.ref] || allowed[hub.ref][this.hub.ref])
			) {
				toCheck.push({
					count: count - 1,
					hub: hub,
				});
				traversed[link.to] = true;
			}
		});

		const nextFactory = (check) => {
			return (link: HubLink) => {
				const childLink = this.mapper.getHub(link.to);

				if (
					!traversed[link.to] &&
					!block[link.to] &&
					(!allowed[link.to] || allowed[link.to][link.from])
				) {
					toCheck.push({
						count: check.count - 1,
						hub: childLink,
						parent: check, // for building path later
					});
					traversed[link.to] = true;
				}
			};
		};

		// iterate over list, it can grow
		while (toCheck.length) {
			const check = toCheck.shift();
			const hub: Hub = check.hub;

			const match =
				allowed[toName] && !allowed[toName][hub.ref]
					? null
					: hub.getLink(toName);

			if (match) {
				let iter = check;

				rtn = [hub, this.mapper.getHub(toName)];

				while (iter.parent) {
					rtn.unshift(iter.parent.hub);
					iter = iter.parent;
				}

				rtn.unshift(this.hub);

				toCheck.length = 0; // exit loop
			} else if (check.count > 1) {
				// if not over count limit, add children to check list
				hub.connections.forEach(nextFactory(check));
			}
		}

		return rtn;
	}
}
