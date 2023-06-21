import {EdgeInterface} from './edge.interface';
import {
	NODE_DEFAULT_TYPE,
	NodeChildSelector,
	NodeInterface,
	NodeJson,
	NodeOperator,
	NodePullSettings,
	NodeReference,
	NodeSettings,
	NodeTag,
	NodeType,
	NodeValueSelector,
} from './node.interface';
import {Weights} from './weights';

/**
 * TODO: I want to allow different types of nodes to exist on a graph all tied to the same event with their own weights.
 *   - Nodes need to get a type ('team', 'player')
 *   - When adding player data, you assign as an edge to the game <event> from the player to the team
 *   - Able to do calculations for all 'players'
 *   - Use players to calculate position scores for teams-
 */

/**
 * TODO: Node can have edge to other nodes, think of games a team
 * has played in this interval
 */
export class Node implements NodeInterface {
	ref: NodeReference;
	type: NodeType;
	edges: EdgeInterface[];
	weights: Weights;
	parent?: Node;
	children?: Map<NodeType, Node[]>;
	tags: NodeTag[];

	constructor(
		ref: NodeReference,
		type: NodeType = NODE_DEFAULT_TYPE,
		settings?: NodeSettings,
	) {
		this.ref = ref;
		this.type = type;
		this.tags = settings?.tags || [];
		this.edges = [];
		this.parent = <Node>settings?.parent || null;
		this.weights = settings?.weights || new Weights();
		this.children = new Map();
	}

	setParent(parent: Node): Node {
		this.parent = parent;

		parent.addChild(this);

		return this;
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

	addEdge(edge: EdgeInterface): Node {
		this.edges.push(edge);

		return this;
	}

	getChildren(selector: NodeChildSelector, deep = false): Node[] {
		if (selector === null) {
			let rtn = [];

			for (const entry of this.children.values()) {
				for (const node of entry) {
					rtn.push(node);

					if (deep) {
						rtn = rtn.concat(node.getChildren(selector, deep));
					}
				}
			}

			return rtn;
		} else if (this.children.has(selector.type)) {
			return this.children.get(selector.type);
		} else if (deep) {
			let rtn = [];

			for (const entry of this.children.values()) {
				for (const node of entry) {
					rtn = rtn.concat(node.getChildren(selector, deep));
				}
			}

			return rtn;
		} else {
			return [];
		}
	}

	setType(type: NodeType) {
		this.type = type;

		return this;
	}

	hasTag(tag: NodeTag): boolean{
		return this.tags.indexOf(tag) !== -1;
	}

	// edge vs weight.  Edge is input from the results, weights are the calculated values.
	// data flow is edge => weight
	bubble(fn: NodeOperator, through = false) {
		if (this.parent) {
			const parent = this.parent;
			// bubble this command up the relationship chain
			// TODO: yeah...
			fn(parent.weights, this.weights);

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
					fn(child.weights, this.weights);

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
		value: number,
	): Promise<boolean> {
		selector === NodeValueSelector.node
			? this.setWeight(mount, value)
			: this.edges.map((edge) =>
					edge.nodeWeights.get(this.ref).set(mount, value),
			  );

		return true;
	}

	// allows access to either current node or edge weights
	async getValue(
		mount: string,
		selector: NodeValueSelector,
	): Promise<number> {
		return selector === NodeValueSelector.node
			? this.getWeight(mount)
			: this.edges.reduce(
					(sum, edge) => sum + edge.nodeWeights.get(this.ref).get(mount),
					0,
			  );
	}

	// allows access to either current node or edge weights
	hasValue(mount: string, selector: NodeValueSelector): boolean {
		return selector === NodeValueSelector.node
			? this.hasWeight(mount)
			: this.edges[0].nodeWeights.get(this.ref).has(mount);
	}

	// allow access to just current values
	setWeight(mount: string, value: number) {
		this.weights.set(mount, value);

		return this;
	}

	getWeight(mount: string): number {
		return this.weights.get(mount);
	}

	hasWeight(mount: string = null): boolean {
		if (this.weights) {
			return this.weights.has(mount);
		}

		return false;
	}

	/*
	compareWeight(interval: Interval, other: Weighted, mount: string): number {
		return this.getWeight(interval, mount) - other.getWeight(interval, mount);
	}

	// return back the data in imploded form
	compareWeights(interval: Interval, other: Weighted, mounts: Record<string, string>): Weights {
		return Object.entries(mounts).reduce((agg, [key, mount]) => {
			agg[key] = this.compareWeight(interval, other, mount);

			return agg;
		}, {});
	}
	*/

	toJSON(): NodeJson {
		const rtn = {
			ref: this.ref,
			type: this.type,
			tags: this.tags,
			parentRef: this.parent?.ref,
			weights: this.weights.toJSON(),
		};

		return rtn;
	}
}
