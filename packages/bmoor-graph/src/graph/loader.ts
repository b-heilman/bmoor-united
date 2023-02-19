import {Tags} from '@bmoor/tagging';

import {Event} from '../event';
import {Graph} from '../graph';
import {Interval} from '../interval';
import {Node} from '../node';
import {NodeSettings} from '../node.interface';
import {
	InputRow,
	LoaderNodeInfo,
	LoaderSettings,
	LoaderVariable,
} from './loader.interface';

function readValue(row: InputRow, settings: LoaderVariable) {
	if (typeof settings === 'function') {
		return settings(row);
	} else if (typeof settings === 'string') {
		// TODO
		return '';
	} else {
		const value = row[settings.mount];

		if (settings.normalizer) {
			return settings.normalizer(value);
		} else {
			return value;
		}
	}
}

export class GraphLoader {
	graph: Graph;
	settings: LoaderSettings;
	intervals: Record<string, Interval>;

	constructor(graph: Graph, settings: LoaderSettings) {
		this.graph = graph;
		this.intervals = {};
		this.settings = settings;
	}

	getInterval(ref, label, tags: Tags = []): Interval {
		let interval = this.intervals[ref];

		if (!interval) {
			interval = new Interval(ref, label, tags);

			this.intervals[ref] = interval;
		}

		return interval;
	}

	getEvent(row: InputRow): Event {
		const setting = this.settings.event;

		const ref = <string>readValue(row, setting.reference);

		let event = this.graph.getEvent(ref);

		if (!event) {
			const intervalRef = <string>readValue(row, setting.interval);
			const intervalLabel = setting.label
				? <string>readValue(row, setting.label)
				: intervalRef;
			const intervalTags = setting.tags ? <string[]>setting.tags(row) : [];

			const order = this.getInterval(
				parseInt(intervalRef),
				intervalLabel,
				intervalTags,
			);

			event = new Event(ref, order);
			this.graph.addEvent(event);
		}

		if (setting.normalizer) {
			event.weights.load(setting.normalizer(row, event.ref));
		}

		return event;
	}

	computeNodeInfo(row: InputRow): LoaderNodeInfo[] {
		return this.settings.nodes.map((setting) => {
			const rtn: LoaderNodeInfo = {
				tags: [],
				type: setting.type,
				reference: <string>readValue(row, setting.reference),
			};

			if (setting.tag) {
				rtn.tags = [<string>readValue(row, setting.tag)];
			}

			if (setting.tags) {
				rtn.tags = rtn.tags.concat(setting.tags(row));
			}

			if (setting.normalizer) {
				rtn.normalizer = setting.normalizer;
			}

			return rtn;
		});
	}

	// Load the entire node heirarchy, and return the primary node which data gets loaded on
	createNodes(row: InputRow, event: Event): Node[] {
		return (this.settings.split ? this.settings.split(row) : [row]).map(
			(seed) => {
				const types = this.computeNodeInfo(seed);

				return types.reduce((prev: Node, info: LoaderNodeInfo) => {
					let node = this.graph.getNode(info.reference);

					if (!node) {
						const settings: NodeSettings = {};

						if (info.tags) {
							settings.tags = info.tags;
						}

						node = new Node(info.reference, info.type, settings);
						this.graph.addNode(node);
					}

					if (prev) {
						node.setParent(event.interval, prev);
					}

					// First time a node is introduced to an event the weights will get set
					if (info.normalizer && !node.hasWeight(event.interval)) {
						node.addEdge(event, info.normalizer(seed, node.ref));
					}

					return node;
				}, null);
			},
		);
	}

	addRow(row: InputRow): void {
		this.createNodes(row, this.getEvent(row));
	}

	load(doc: InputRow[]) {
		doc.map((row) => this.addRow(row));
	}

	fromArray(arr: (string | number)[][]) {
		const top = arr.shift();
		const doc = [];

		for (const row of arr) {
			const rowInfo = {};

			for (const pos in top) {
				rowInfo[top[pos]] = row[pos];
			}

			doc.push(rowInfo);
		}

		this.load(doc);
	}
}
