import {Weighted} from './weighted';
import {Event} from './event';
import {NodeInterface, NodeJSON} from './node.interface';

/**
 * TODO: I want to allow different types of nodes to exist on a graph all tied to the same event with their own weights.
 *   - Nodes need to get a type ('team', 'player')
 *   - When adding player data, you assign as an edge to the game <event> from the player to the team
 *   - Able to do calculations for all 'players'
 *   - Use players to calculate position scores for teams
 */
export class Node extends Weighted implements NodeInterface {
	ref: string;
	events: Map<NodeInterface, Event[]>;

	constructor(ref: string) {
		super();

		this.ref = ref;
		this.events = new Map();
	}

	addEvent(event: Event) {
		const other = event.getOther(this);
		const collection = this.events.get(other);

		if (collection) {
			collection.push(event);
		} else {
			this.events.set(other, [event]);
		}
	}
	/*
	getEdge(check: Event): Edge {
		return this.byEvent[check.ref];
	}
	*/
	getEvents(check: Node = null): Event[] {
		if (check) {
			return this.events.get(check) || [];
		} else {
			return Array.from(this.events.values()).flat();
		}
	}

	getEventCount() {
		return Object.values(this.events).reduce(
			(agg, events) => agg + events.length,
			0
		);
	}

	toJSON(): NodeJSON {
		return {
			ref: this.ref,
			weights: this.weights
		};
	}
}
