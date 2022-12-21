import {Weighted} from './weighted';
import {Event} from './event';
import {
	NodeInterface, NodeJSON, NodeOperator, NODE_DEFAULT_TYPE, NodeType, NodeReference
} from './node.interface';
import { EventOrder } from './event.interface';
/**
 * TODO: I want to allow different types of nodes to exist on a graph all tied to the same event with their own weights.
 *   - Nodes need to get a type ('team', 'player')
 *   - When adding player data, you assign as an edge to the game <event> from the player to the team
 *   - Able to do calculations for all 'players'
 *   - Use players to calculate position scores for teams-
 */
export class Node extends Weighted implements NodeInterface {
	ref: NodeReference;
	type: NodeType;
	parent: Node;
	events: Map<EventOrder, Event>;
	children: Map<string, Node[]>;

	constructor(ref: string, type: string = NODE_DEFAULT_TYPE, parent: Node=null) {
		super();

		this.ref = ref;
		this.type = type;
		this.events = new Map();
		this.parent = parent;
		this.children = new Map();

		if (parent) {
			parent.addChild(type, this);
		}
	}

	addChild(type: string, child: Node){
		const arr = this.children.get(type);

		if (arr) {
			arr.push(child)
		} else {
			this.children.set(type, [child]);
		}
	}

	setType(type: string){
		this.type = type;

		return this;
	}

	addEvent(event: Event) {
		this.events.set(event.order, event);

		return this;
	}
	
	getEvents(): Event[] {
		return Array.from(this.events.values()).flat();
	}

	getEventCount() {
		return Object.values(this.events).reduce(
			(agg, events) => agg + events.length,
			0
		);
	}

	bubble(interval: EventOrder, fn: NodeOperator, through=false){
		if (this.parent){
			// bubble this command up the relationship chain
			fn(this.parent.getWeights(interval), this.getWeights(interval));

			if (through){
				this.parent.bubble(interval, fn);
			}
		}

		return this;
	}

	trickle(interval: EventOrder, fn: NodeOperator, through=true){
		// trickle this command down the relationship chain
		for (const children of this.children.values()){
			for (const child of children){
				fn(child.getWeights(interval), this.getWeights(interval));

				if (through && child.children.size !== 0){
					child.trickle(interval, fn);
				}
			}
		}

		return this;
	}

	getLineage(): Node[]{
		// make sure children are returned before their parent
		const rtn = [];
		for (const children of this.children.values()){
			for (const child of children){
				if (child.children.size !== 0){
					rtn.push(child.getLineage())
				}

				rtn.push(child);
			}
		}

		return rtn.flat();
	}

	pull(interval: EventOrder, fn: NodeOperator){
		const lineage = this.getLineage();
		// children will always be left of the parent
		for (const sub of lineage){
			sub.bubble(interval, fn, false);
		}

		return this;
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

	toJSON(): NodeJSON {
		return {
			ref: this.ref,
			type: this.type,
			intervals: this.intervals
		};
	}
}
