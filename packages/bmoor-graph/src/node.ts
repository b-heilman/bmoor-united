import {Edge} from './edge';
import {Event} from './event';
import {
	NodeInterface,
	NodeJson,
	NodeOperator,
	NODE_DEFAULT_TYPE,
	NodeType,
	NodeReference,
	NodeSettings,
	NodeTag
} from './node.interface';
import {Interval} from './interval.interface';
import {Weights} from './weights';
/**
 * TODO: I want to allow different types of nodes to exist on a graph all tied to the same event with their own weights.
 *   - Nodes need to get a type ('team', 'player')
 *   - When adding player data, you assign as an edge to the game <event> from the player to the team
 *   - Able to do calculations for all 'players'
 *   - Use players to calculate position scores for teams-
 */
export class Node implements NodeInterface {
	ref: NodeReference;
	type: NodeType;
	tag: NodeTag;
	parent: Node;
	events: Map<Interval, Event>;
	intervals: Map<Interval, Weights>;
	children: Node[];

	constructor(
		ref: string,
		type: string = NODE_DEFAULT_TYPE,
		settings?: NodeSettings
	) {
		this.ref = ref;
		this.type = type;
		this.tag = settings?.tag;
		this.events = new Map();
		this.parent = <Node>settings?.parent;
		this.children = [];
		this.intervals = new Map();

		if (this.parent) {
			this.parent.addChild(this);
		}
	}

	addChild(child: Node) {
		this.children.push(child);
	}

	setType(type: string) {
		this.type = type;

		return this;
	}

	addEvent(event: Event) {
		// and event should be added to the lowest child, it will be
		// bubbled up to all the parent nodes.  I want to make sure
		// I protect from event collisions.
		if (this.events.has(event.interval)) {
			const check = this.events.get(event.interval);

			if (check !== event) {
				throw new Error('interval collision: ' + JSON.stringify(event));
			}
		} else {
			this.events.set(event.interval, event);

			if (this.parent) {
				this.parent.addEvent(event);
			}
		}

		return this;
	}

	getEvent(interval: Interval): Event {
		return this.events.get(interval);
	}

	getEdge(interval: Interval): Edge {
		return <Edge>this.events.get(interval)?.getEdge(this);
	}

	getEvents(other?: Node, intervals?: Interval[]): Event[] {
		if (other) {
			const rtn = [];

			if (!intervals) {
				intervals = Array.from(this.events.keys());
			}

			for (const interval of intervals) {
				const event = this.events.get(interval);
				if (event.edges.get(other.type)?.has(other)) {
					rtn.push(event);
				}
			}

			return rtn;
		} else {
			return Array.from(this.events.values());
		}
	}

	getEventCount() {
		return Object.values(this.events).reduce(
			(agg, events) => agg + events.length,
			0
		);
	}

	getRelated(interval: Interval, tag?: NodeTag): Node[] {
		const nodes = this.events.get(interval).edges.get(this.type);
		const iterator = nodes.entries();

		const rtn = [];

		for (const [node] of iterator) {
			if (node !== this && (!tag || node.tag === tag)) {
				rtn.push(node);
			}
		}

		return rtn;
	}

	// edge vs weight.  Edge is input from the results, weights are the calculated values.
	// data flow is edge => weight
	bubble(interval: Interval, fn: NodeOperator, through = false) {
		if (this.parent) {
			// bubble this command up the relationship chain
			fn(this.parent.getWeights(interval), this.getWeights(interval));

			if (through) {
				this.parent.bubble(interval, fn);
			}
		}

		return this;
	}

	trickle(interval: Interval, fn: NodeOperator, through = true) {
		// trickle this command down the relationship chain
		for (const child of this.children) {
			fn(child.getWeights(interval), this.getWeights(interval));

			if (through && child.children.length !== 0) {
				child.trickle(interval, fn);
			}
		}

		return this;
	}

	// returns back the whole lineage of the node, keeps them in order to
	// optimize if you're bubbling
	getLineage(checkContinue?: (node: Node) => boolean): Node[] {
		// make sure children are returned before their parent
		const rtn = [];
		for (const child of this.children) {
			if (child.children.length !== 0 && (!checkContinue || checkContinue(child))) {
				rtn.push(child.getLineage());
			}

			rtn.push(child);
		}

		return rtn.flat();
	}

	pull(interval: Interval, fn: NodeOperator, checkContinue?: (node: Node) => boolean) {
		const lineage = this.getLineage(checkContinue);
		// children will always be left of the parent
		for (const sub of lineage) {
			sub.bubble(interval, fn, false);
		}

		return this;
	}

	getWeights(interval: Interval): Weights {
		let weights = this.intervals.get(interval);

		if (!weights) {
			weights = new Weights();

			this.intervals.set(interval, weights);
		}

		return weights;
	}

	setWeight(interval: Interval, mount: string, value: number) {
		this.getWeights(interval).set(mount, value);

		return this;
	}

	getWeight(interval: Interval, mount: string): number {
		return this.getWeights(interval).get(mount) || null;
	}

	hasWeight(interval: Interval, mount: string = null): boolean {
		if (this.intervals.has(interval)){
			if (mount){
				return this.getWeights(interval).has(mount);
			} else {
				return true;
			}
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
		return {
			ref: this.ref,
			type: this.type,
			weights: Array.from(this.intervals).map(([interval, weight]) => {
				return {
					interval: interval.ref,
					data: weight.toJSON()
				};
			}),
			parentRef: this.parent?.ref
		};
	}
}
