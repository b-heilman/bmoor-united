import {Tags} from '@bmoor/tagging';

import {Event} from './event';
import {Interval} from './interval';
import {
	NODE_DEFAULT_TYPE,
	NodeInterface,
	NodeIntervalData,
	NodeIntervalJson,
	NodeJson,
	NodeOperator,
	NodePullSettings,
	NodeReference,
	NodeSettings,
	NodeTag,
	NodeType,
} from './node.interface';
import {Weights} from './weights';
import {WeightData} from './weights.interface';

/**
 * TODO: I want to allow different types of nodes to exist on a graph all tied to the same event with their own weights.
 *   - Nodes need to get a type ('team', 'player')
 *   - When adding player data, you assign as an edge to the game <event> from the player to the team
 *   - Able to do calculations for all 'players'
 *   - Use players to calculate position scores for teams-
 */
function addEvent(node: Node, event: Event) {
	const intervalData = node.getIntervalData(event.interval);

	// and event should be added to the lowest child, it will be
	// bubbled up to all the parent nodes.  I want to make sure
	// I protect from event collisions.
	if (intervalData.event) {
		if (intervalData.event !== event) {
			console.log(
				'existing:',
				node.ref,
				JSON.stringify(intervalData.event),
			);
			throw new Error('interval collision: ' + JSON.stringify(event));
		}
	} else {
		intervalData.event = event;

		event.addNode(node);

		if (intervalData.parent) {
			// TODO: define the interface properly so I don't need to do this
			addEvent(<Node>intervalData.parent, event);
		}
	}

	return intervalData;
}

export class Node implements NodeInterface {
	ref: NodeReference;
	type: NodeType;
	tags: Tags;
	intervals: Map<Interval, NodeIntervalData>;

	constructor(
		ref: string,
		type: string = NODE_DEFAULT_TYPE,
		settings?: NodeSettings,
	) {
		this.ref = ref;
		this.type = type;
		this.tags = settings?.tags || [];
		this.intervals = new Map();
	}

	hasIntervalData(interval: Interval): boolean {
		return this.intervals.has(interval);
	}

	getIntervalData(interval: Interval): NodeIntervalData {
		let rtn: NodeIntervalData = this.intervals.get(interval);

		if (!rtn) {
			rtn = {};

			this.intervals.set(interval, rtn);
		}

		return rtn;
	}

	setParent(interval: Interval, parent: Node): Node {
		const intervalData = this.getIntervalData(interval);

		if (intervalData.parent) {
			if (intervalData.parent === parent) {
				return this;
			} else {
				throw new Error(
					`For interval ${interval.ref}, ${this.ref} already has ` +
						`${intervalData.parent.ref}, tried ${parent.ref}`,
				);
			}
		} else {
			intervalData.parent = parent;
		}

		const parentData = parent.getIntervalData(interval);

		if (!parentData.children) {
			parentData.children = [];
		}

		parentData.children.push(this);

		return this;
	}

	setType(type: string) {
		this.type = type;

		return this;
	}

	addEdge(event: Event, weights: WeightData): Node {
		const intervalData = addEvent(this, event);

		intervalData.edgeWeights = new Weights(weights);

		return this;
	}

	getEvent(interval: Interval): Event {
		return <Event>this.getIntervalData(interval).event;
	}

	hasEdge(interval: Interval): boolean {
		return (
			this.hasIntervalData(interval) &&
			'edgeWeights' in this.getIntervalData(interval)
		);
	}

	getEdge(interval: Interval): Weights {
		return this.getIntervalData(interval).edgeWeights;
	}

	getEvents(other?: Node, intervals?: Interval[]): Event[] {
		if (other) {
			const rtn = [];

			if (!intervals) {
				intervals = Array.from(this.intervals.keys());
			}

			for (const interval of intervals) {
				const intervalData = this.getIntervalData(interval);

				if (
					intervalData.event &&
					intervalData.event.nodes.get(other.type)?.includes(other)
				) {
					rtn.push(intervalData.event);
				}
			}

			return rtn;
		} else {
			return <Event[]>Array.from(this.intervals.values())
				.map((nd) => nd.event)
				.filter((event) => !!event);
		}
	}

	getRelated(interval: Interval, tag?: NodeTag): Node[] {
		const rtn = [];
		const intervalData = this.getIntervalData(interval);

		if (intervalData.event) {
			const nodes = intervalData.event.nodes.get(this.type);

			for (const node of nodes) {
				if (node !== this && (!tag || node.tags.includes(tag))) {
					rtn.push(node);
				}
			}
		}

		return rtn;
	}

	// edge vs weight.  Edge is input from the results, weights are the calculated values.
	// data flow is edge => weight
	bubble(interval: Interval, fn: NodeOperator, through = false) {
		const intervalData = this.getIntervalData(interval);

		if (intervalData.parent) {
			const parent = <Node>intervalData.parent;
			// bubble this command up the relationship chain
			// TODO: yeah...
			fn(parent.getWeights(interval), intervalData.weights);

			if (through) {
				parent.bubble(interval, fn);
			}
		}

		return this;
	}

	trickle(interval: Interval, fn: NodeOperator, through = true) {
		const intervalData = this.getIntervalData(interval);

		// trickle this command down the relationship chain
		if (intervalData.children) {
			for (const child of intervalData.children) {
				fn((<Node>child).getWeights(interval), this.getWeights(interval));

				if (through) {
					(<Node>child).trickle(interval, fn);
				}
			}
		}

		return this;
	}

	// returns back the whole lineage of the node, keeps them in order to
	// optimize if you're bubbling
	getLineage(
		interval: Interval,
		checkContinue?: (node: Node) => boolean,
	): Node[] {
		// make sure children are returned before their parent
		const rtn = [];
		const intervalData = this.getIntervalData(interval);

		if (intervalData.children) {
			for (const child of intervalData.children) {
				if (!checkContinue || checkContinue(<Node>child)) {
					rtn.push((<Node>child).getLineage(interval, checkContinue));
				}

				rtn.push(child);
			}
		}

		return rtn.flat();
	}

	pull(
		interval: Interval,
		fn: NodeOperator,
		settings: NodePullSettings = null,
	) {
		const lineage = this.getLineage(interval, settings?.continue);
		// children will always be left of the parent
		for (const sub of lineage) {
			sub.bubble(interval, fn, false);
		}

		return this;
	}

	getWeights(interval: Interval): Weights {
		const intervalData = this.getIntervalData(interval);

		if (!intervalData.weights) {
			intervalData.weights = new Weights();
		}

		return intervalData.weights;
	}

	setWeight(interval: Interval, mount: string, value: number) {
		this.getWeights(interval).set(mount, value);

		return this;
	}

	getWeight(interval: Interval, mount: string): number {
		return this.getWeights(interval).get(mount);
	}

	hasWeight(interval: Interval, mount: string = null): boolean {
		const intervalData = this.getIntervalData(interval);

		if (intervalData.weights) {
			if (mount) {
				return intervalData.weights.has(mount);
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
		const rtn = {
			ref: this.ref,
			type: this.type,
			tags: this.tags,
			intervals: Array.from(this.intervals).map(
				([interval, intervalData]) => {
					const rtn: NodeIntervalJson = {
						intervalRef: interval.ref,
					};

					if (intervalData.weights) {
						rtn.weights = intervalData.weights.toJSON();
					}

					if (intervalData.parent) {
						rtn.parentRef = intervalData.parent.ref;
					}

					if (intervalData.event) {
						rtn.eventRef = intervalData.event.ref;
					}

					if (intervalData.edgeWeights) {
						rtn.edge = intervalData.edgeWeights.toJSON();
					}

					return rtn;
				},
			),
		};

		return rtn;
	}
}
