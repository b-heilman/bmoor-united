import { Weights } from './weighted.interface';
import { Event } from './event';
import { Edge } from './edge';
import { Node } from './node';
import { NodeReference, NodeType } from './node.interface';
import { List } from './list';
import { GraphJSON } from './graph.iterface';
import { EventOrder, EventReference } from './event.interface';

export class Graph {
	nodes: Map<NodeReference, Node>;
	nodesByType: Map<NodeType, Node[]>;
	events: Map<EventReference, Event>;
	eventsByOrder: Map<EventOrder, Event[]>;
	eventOrders: EventOrder[];

	constructor() {
		this.nodes = new Map();
		this.nodesByType = new Map()
		this.events = new Map();
		this.eventsByOrder = new Map();
		this.eventOrders = null;
	}

	addNode(node: Node) {
		const hasNode = this.nodes.has(node.ref);

		if (!hasNode){
			this.nodes.set(node.ref, node);

			const list = this.nodesByType.get(node.type);

			if (list){
				list.push(node);
			} else {
				this.nodesByType.set(node.type, [node]);
			}
		} else {
			// TODO: throw an exception?
		}

		return this;
	}

	getNode(ref: NodeReference) {
		return this.nodes.get(ref);
	}

	getNodesByType(type: NodeType) {
		return this.nodesByType.get(type);
	}

	addEvent(event: Event) {
		const hasEvent = this.events.has(event.ref);

		if (!hasEvent){
			this.events.set(event.ref, event);

			const list = this.eventsByOrder.get(event.order);

			if (list){
				list.push(event);
			} else {
				this.eventsByOrder.set(event.order, [event]);
			}
		} else {
			// TODO: throw an exception?
		}

		return this;
	}

	getEvent(ref: NodeReference) {
		return this.events.get(ref);
	}

	setEventOrder(orders: EventOrder[]){
		// If the order is timestamps, I want the oldest at the top
		this.eventOrders = orders.sort((a, b) => a.order - b.order);
	}

	getEventsByOrder(order: EventOrder) {
		return this.eventsByOrder.get(order);
	}

	getEventsInOrder(until: EventOrder = null, from: EventOrder = null): Event[][] {
		let orders = null;

		if (until){
			const fromPos = from ? this.eventOrders.indexOf(from) : 0;

			const untilPos = this.eventOrders.indexOf(until, fromPos);

			orders = this.eventOrders.slice(fromPos, untilPos);
		} else {
			orders = this.eventOrders;
		}

		return orders.map(order => this.getEventsByOrder(order));
	}

	toArray(field: string = null) {
		if (field) {
			return Object.values(this.nodes).sort((nodeA, nodeB) => {
				return nodeB.getWeight(field) - nodeA.getWeight(field);
			});
		} else {
			// TODO: This isn't right
			return Object.values(this.nodes);
		}
	}

	toJSON(): GraphJSON {
		return {
			nodes: Array.from(this.nodes).map(([key, node]) => node.toJSON()),
			events: Array.from(this.events).map(([key, event]) => event.toJSON())
		};
	}
}

/*
export function load(source: string): Graph {
	const schema = <GraphJSON>JSON.parse(source);
	const graph = new Graph();

	schema.nodes.map(({ ref, weights }) => {
		graph.getNode(ref).addWeights(weights);
	});

	Object.entries(schema.events).forEach(([partition, events]) => {
		events.map(({ ref, weights, edges }) => {
			graph.addEvent(ref, partition).addWeights(weights);

			edges.forEach(({ from, to, weights }) => {
				graph.connect(partition, ref, from, to).edge.addWeights(weights);
			});
		});
	});

	return graph;
}
*/
export function dump(graph: Graph): string {
	return JSON.stringify(graph, null, '\t');
}
