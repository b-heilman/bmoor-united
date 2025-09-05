import {implode} from '@bmoor/object';

import {EventInterface, EventReference} from './event.interface.ts';
import {FeatureValue, FeatureValues} from './features.interface.ts';
import {Features} from './features.ts';
import {
	NODE_DEFAULT_TYPE,
	NodeBuilder,
	NodeEdgeLabel,
	NodeInterface,
	NodeJSON,
	NodeOperator,
	NodePullSettings,
	NodeReference,
	NodeSelector,
	NodeSettings,
	NodeTag,
	NodeType,
	NodeValueSelector,
} from './node.interface.ts';

/**
 * TODO: I want to allow different types of nodes to exist on a graph all tied to the same event with their own features.
 *   - Nodes need to get a type ('team', 'player')
 *   - When adding player data, you assign as an event to the game <event> from the player to the team
 *   - Able to do calculations for all 'players'
 *   - Use players to calculate position scores for teams-
 */

/**
 * TODO: Node can have event to other nodes, think of games a team
 * has played in this interval
 */
export class Node implements NodeInterface {
	ref: NodeReference;
	type: NodeType;
	events: Map<EventReference, EventInterface>;
	features: Features;
	parent?: Node;
	children: Map<NodeType, Node[]>;
	edges: Map<NodeEdgeLabel, Map<NodeReference, Node>>;
	metadata: Map<string, NodeTag>;

	constructor(
		ref: NodeReference,
		type: NodeType = NODE_DEFAULT_TYPE,
		settings?: NodeSettings,
	) {
		this.ref = ref;
		this.type = type;
		this.events = new Map();
		this.edges = new Map();
		this.parent = null;
		this.children = new Map();
		this.metadata = new Map();
		this.features = new Features();

		if (settings) {
			if (settings.features) {
				this.addFeatures(settings.features);
			}

			if (settings.metadata) {
				this.setMetadata(settings.metadata);
			}

			if (settings.parent) {
				this.setParent(<Node>settings.parent);
			}
		}
	}

	setParent(parent: Node): Node {
		this.parent = parent;

		parent.addChild(this);

		return this;
	}

	hasParent() {
		return this.parent !== null;
	}

	addFeatures(features: FeatureValues) {
		this.features.load(features);
	}

	hasFeatures() {
		return this.features.hasData();
	}

	setMetadata(metadata: Record<string, NodeTag>) {
		this.metadata = new Map(Object.entries(implode(metadata)));
	}

	hasMetadata() {
		return this.metadata.size > 0;
	}

	addChild(child: Node): Node {
		if (this.children.has(child.type)) {
			this.children.get(child.type).push(child);
		} else {
			this.children.set(child.type, [child]);
		}

		if (!child.parent) {
			child.parent = this;
		}

		return this;
	}

	hasChildren(): boolean {
		return this.children.size !== 0;
	}

	addEvent(event: EventInterface): Node {
		if (!this.events.has(event.ref)) {
			this.events.set(event.ref, event);
		}

		return this;
	}

	hasEdge(label: NodeEdgeLabel, node: Node) {
		return this.edges.get(label)?.has(node.ref);
	}

	addEdge(label: NodeEdgeLabel, node: Node): Node {
		const edgeSet = this.edges.get(label);

		if (edgeSet) {
			edgeSet.set(node.ref, node);
		} else {
			const inside = new Map();
			inside.set(node.ref, node);

			this.edges.set(label, inside);
		}

		return this;
	}

	hasEdges(): boolean {
		return this.edges.size > 0;
	}

	/** NEXT
	 * - Loader adding edge
	 * - search via edges
	 ***/

	getChildren(deep): Node[] {
		let rtn = [];

		for (const entry of this.children.values()) {
			for (const node of entry) {
				rtn.push(node);

				if (deep) {
					rtn = rtn.concat(node.getChildren(deep));
				}
			}
		}

		return rtn;
	}

	selectChildren(selector: NodeSelector, deep = false): Node[] {
		let rtn: Node[] = [];

		if (this.type === selector.type) {
			rtn = [this];
		} else if (this.children.has(selector.type)) {
			rtn = this.children.get(selector.type);
		} else if (deep) {
			for (const entry of this.children.values()) {
				for (const node of entry) {
					rtn = rtn.concat(node.selectChildren(selector, deep));
				}
			}
		}

		return rtn;
	}

	selectParent(selector: NodeSelector): Node {
		let found = null;

		if (this.type === selector.parent) {
			found = this; // eslint-disable-line @typescript-eslint/no-this-alias
		} else {
			let cur: Node = this; // eslint-disable-line @typescript-eslint/no-this-alias

			while (cur && found === null) {
				if (cur.type === selector.parent) {
					found = cur;
				} else {
					cur = cur.parent;
				}
			}
		}

		return found;
	}

	selectEdges(selector: NodeSelector): Node[] {
		return Array.from(this.edges.get(selector.edge)?.values() || []);
	}

	selectSiblings(selector: NodeSelector): Node[] {
		if (this.parent?.children.has(selector.sibling)) {
			if (selector.sibling === this.type) {
				return this.parent.children
					.get(selector.sibling)
					.filter((node) => node !== this);
			} else {
				return this.parent.children.get(selector.sibling);
			}
		}

		return [];
	}

	select(selector: NodeSelector): Node[] {
		let rtn: Node[] = null;

		if (!selector) {
			// return all leafs
			rtn = this.getChildren(true);
		} else {
			let root: Node = null;

			if (selector.assume) {
				root = this.selectParent({parent: selector.assume});

				if (!root) {
					const check = this.selectChildren({type: selector.assume}, true);

					if (check.length === 0) {
						throw new Error('unable to assume: ' + selector.assume);
					} else if (check.length > 1) {
						throw new Error('assuming too much: ' + selector.assume);
					} else {
						root = check[0];
					}
				}
			} else {
				root = this; // eslint-disable-line @typescript-eslint/no-this-alias
			}

			rtn = [selector.parent ? root.selectParent(selector) : root];

			if (selector.edge) {
				rtn = rtn.flatMap((node) => node.selectEdges(selector));
			}

			if (selector.sibling) {
				rtn = rtn.flatMap((node) => node.selectSiblings(selector));
			}

			if (selector.type) {
				rtn = rtn.flatMap((node) =>
					node.selectChildren({type: selector.type}, true),
				);
			}

			if (selector.metadata) {
				for (const [mount, tag] of Object.entries(selector.metadata)) {
					rtn = rtn.filter((node) => node.searchMetadata(mount, tag));
				}
			}
		}

		return rtn;
	}

	setType(type: NodeType) {
		this.type = type;

		return this;
	}

	searchMetadata(mount: string, tag: NodeTag = null): boolean {
		if (tag) {
			return this.metadata.get(mount) === tag;
		} else {
			return this.metadata.has(mount);
		}
	}

	// event vs weight.  Event is input from the results, features are the calculated values.
	// data flow is event => weight
	bubble(fn: NodeOperator, through = false) {
		if (this.parent) {
			const parent = this.parent;
			// bubble this command up the relationship chain
			fn(parent.features, this.features);

			if (through) {
				parent.bubble(fn);
			}
		}

		return this;
	}

	trickle(fn: NodeOperator, through = true) {
		// trickle this command down the relationship chain
		if (this.children) {
			for (const childList of this.children.values()) {
				for (const child of childList) {
					fn(child.features, this.features);

					if (through) {
						child.trickle(fn);
					}
				}
			}
		}

		return this;
	}

	// returns back the whole lineage of the node, keeps them in order to
	// optimize if you're bubbling
	getLineage(checkContinue?: (node: Node) => boolean): Node[] {
		// make sure children are returned before their parent
		const rtn = [];

		if (this.children) {
			for (const childList of this.children.values()) {
				for (const child of childList) {
					if (!checkContinue || checkContinue(child)) {
						rtn.push(child.getLineage(checkContinue));
					}

					rtn.push(child);
				}
			}
		}

		return rtn.flat();
	}

	pull(fn: NodeOperator, settings: NodePullSettings = null) {
		const lineage = this.getLineage(settings?.continue);
		// children will always be left of the parent
		for (const sub of lineage) {
			sub.bubble(fn, false);
		}

		return this;
	}

	async setValue(
		mount: string,
		selector: NodeValueSelector,
		value: FeatureValue,
	): Promise<boolean> {
		if (selector === NodeValueSelector.node) {
			this.setWeight(mount, value);
		} else {
			Array.from(this.events.values()).map((event) =>
				event.getNodeFeatures(this.ref).set(mount, value),
			);
		}

		return true;
	}

	// allows access to either current node or event features
	async getValue(
		mount: string,
		selector: NodeValueSelector,
	): Promise<FeatureValue> {
		if (selector === NodeValueSelector.node) {
			return this.getWeight(mount);
		} else {
			return Promise.all(
				Array.from(this.events.values()).map((event) =>
					event.getNodeFeatures(this.ref).get(mount),
				),
			).then((values) => {
				if (values.length > 1) {
					return values.reduce(
						(sum: number, value: number | boolean) => sum + +value,
						0,
					);
				} else {
					return values[0] || 0;
				}
			});
		}
	}

	// allows access to either current node or event features
	hasValue(mount: string, selector: NodeValueSelector): boolean {
		if (selector === NodeValueSelector.node) {
			return this.hasWeight(mount);
		} else {
			return Array.from(this.events.values()).reduce(
				(prev, event) => prev || event.hasNodeFeature(this.ref, mount),
				false,
			);
		}
	}

	// allow access to just current values
	setWeight(mount: string, value: FeatureValue) {
		this.features.set(mount, value);

		return this;
	}

	getWeight(mount: string): FeatureValue {
		return this.features.get(mount);
	}

	hasWeight(mount: string = null): boolean {
		if (this.features) {
			return this.features.has(mount);
		}

		return false;
	}

	/*
	compareWeight(interval: Interval, other: Weighted, mount: string): number {
		return this.getWeight(interval, mount) - other.getWeight(interval, mount);
	}

	// return back the data in imploded form
	compareFeatures(interval: Interval, other: Weighted, mounts: Record<string, string>): Features {
		return Object.entries(mounts).reduce((agg, [key, mount]) => {
			agg[key] = this.compareWeight(interval, other, mount);

			return agg;
		}, {});
	}
	*/

	toJSON(ignore = null): NodeJSON {
		const rtn: NodeJSON = {
			ref: this.ref,
			type: this.type,
		};

		if (this.metadata.size) {
			rtn.metadata = Object.fromEntries(this.metadata);
		}

		if (this.parent && this.parent !== ignore) {
			rtn.parentRef = this.parent.ref;
		}

		if (this.features.hasData()) {
			rtn.features = this.features.toJSON();
		}

		if (this.edges.size) {
			rtn.edges = Array.from(this.edges.entries()).reduce(
				(agg, [label, edgeSet]) => {
					agg[label] = Array.from(edgeSet.values()).map(
						(node) => node.ref,
					);
					return agg;
				},
				{},
			);
		}

		return rtn;
	}
}

export function load(
	source: NodeJSON,
	builder: NodeBuilder,
	define = true,
) {
	if (!source.ref) {
		throw new Error('invalid ref: ' + JSON.stringify(source));
	}

	let node: Node = null;
	let info = builder.get(source.ref);

	if (info) {
		node = <Node>info.node;
	} else {
		node = new Node(source.ref);
		info = {
			node,
			stub: !define,
		};

		builder.set(node.ref, info);
	}

	/**
	 * I can't lock this down to prevent overwrite because if you join together two graphs,
	 * the order of definition shouldn't matter.  Because of that, I need to invoking code
	 * to contain the logic if it's defining or not.
	 */
	if (define) {
		info.stub = false;

		if (source.type) {
			node.type = source.type;
		}

		// TODO: any way to not need to do this check?
		if (source.parentRef && !node.parent) {
			node.setParent(load({ref: source.parentRef}, builder, true));
		}

		if (source.features) {
			node.addFeatures(source.features);
		}

		if (source.metadata) {
			node.setMetadata(source.metadata);
		}

		if (source.edges) {
			for (const label in source.edges) {
				const edgeSet = source.edges[label];

				for (const ref of edgeSet) {
					if (ref === null) {
						throw new Error('edge failed for: ' + JSON.stringify(source));
					}

					const other = load({ref}, builder, false);
					if (!node.hasEdge(label, other)) {
						node.addEdge(label, other);
					}
				}
			}
		}
	}

	return node;
}
