import {Node} from '../node';
import {Edge} from '../edge';
import {Event} from '../event';
import {Graph} from '../graph';
import {Interval} from '../interval.interface';
import {
	LoaderSettings,
	InputRow,
	LoaderNodeInfo,
	LoaderVariable
} from './loader.interface';
import {NodeSettings} from '../node.interface';

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

	getOrder(orderPos, label): Interval {
		let order = this.intervals[orderPos];

		if (!order) {
			order = {
				ref: orderPos,
				label
			};

			this.intervals[orderPos] = order;
		}

		return order;
	}

	getEvent(row: InputRow): Event {
		const setting = this.settings.event;

		const ref = <string>readValue(row, setting.reference);

		let event = this.graph.getEvent(ref);

		if (!event) {
			const readOrder = <string>readValue(row, setting.interval);
			const readLabel = setting.label
				? <string>readValue(row, setting.label)
				: readOrder;

			const order = this.getOrder(parseInt(readOrder), readLabel);

			event = new Event(ref, order);
			this.graph.addEvent(event);
		}

		return event;
	}

	computeNodeInfo(row: InputRow): LoaderNodeInfo[] {
		return this.settings.nodes.map((setting) => {
			const rtn: LoaderNodeInfo = {
				type: setting.type,
				reference: <string>readValue(row, setting.reference)
			};

			if (setting.tag) {
				rtn.tag = <string>readValue(row, setting.tag);
			}

			if (setting.normalizer) {
				rtn.normalizer = setting.normalizer;
			}

			return rtn;
		});
	}

	// Load the entire node heirarchy, and return the primary node which data gets loaded on
	createNodes(row: InputRow, event: Event): Node {
		const types = this.computeNodeInfo(row);

		return types.reduce((prev: Node, info) => {
			let node = this.graph.getNode(info.reference);

			if (!node) {
				const settings: NodeSettings = {
					parent: prev
				};

				if (info.tag) {
					settings.tag = info.tag;
				}

				node = new Node(info.reference, info.type, settings);
				this.graph.addNode(node);
			}

			// First time a node is introduced to an event the weights will get set
			if (info.normalizer && !node.hasWeight(event.interval)) {
				const edge = new Edge(node);

				event.addEdge(edge);

				edge.weights.load(info.normalizer(row));

				node.addEvent(event);
			}

			return node;
		}, null);
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
