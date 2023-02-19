import {Tagging} from '@bmoor/tagging';

import {Graph} from '../graph';
import {Interval} from '../interval';
import {Node} from '../node';
import {Weights} from '../weights';
import {
	GraphSelectionComparator,
	GraphSelectionSettings,
	GraphSelectionSubSettings,
} from './selection.interface';

export function select(
	selector: GraphSelectionSettings,
	incoming: Node[] | GraphSelection,
): Node[] {
	let nodes: Node[] = null;

	// we optimize sub selection by using the
	if (incoming instanceof GraphSelection) {
		if (selector.tag) {
			nodes = incoming.tagging.get(selector.tag);
		} else {
			nodes = incoming.nodes.slice();
		}
	} else {
		nodes = <Node[]>incoming;

		if (selector.tag) {
			nodes = nodes.filter((node) => node.tags.includes(selector.tag));
		}
	}

	if (selector.sort) {
		nodes.sort((a, b) =>
			selector.sort(
				a.getWeights(selector.interval),
				b.getWeights(selector.interval),
			),
		);
	}

	if (selector.top) {
		nodes = nodes.slice(0, selector.top);
	} else if (selector.bottom) {
		const length = nodes.length;

		nodes = nodes.slice(length - selector.bottom, length);
	}

	return nodes;
}

/**
 * edge vs weight.  Edge is input from the results, weights are the calculated values.
 * data flow is edge => node.weight, never allow a edge to be set from node.weights
 */
// NOTE: maybe an idea is all calculations in a selection go to a temp, which then can
//   be written to the node instead of being written directly to the node.
export class GraphSelection {
	nodes: Node[];
	tagging: Tagging<Node>;
	graph: Graph;
	sorted: boolean;
	settings: GraphSelectionSettings;
	intervals: Interval[];

	constructor(
		graph: Graph,
		settings: GraphSelectionSettings,
		pool: Node[] | GraphSelection = null,
		sorted = false,
	) {
		this.graph = graph;
		this.tagging = new Tagging();
		this.settings = settings;
		this.intervals = null;

		this.nodes = select(
			settings,
			/***
			 * TODO: this makes me feel like selected need to become a higher level thing.  Do I need to tie
			 * into a tiered thing where type -> tagging?  The below loses its 'tagged' benefit from the graph
			 * or do I need to do some kind of cross tagging?  If I do that though is it turtles all the way
			 * down?  If I tackle that now, that's premature optimization so leaving this for peace of mind.
			 ***/
			pool || this.graph.getNodesByType(settings.type),
		);

		this.nodes.forEach((node) => this.tagging.add(node, node.tags));

		this.sorted = settings.sort ? true : sorted;
	}

	getIntervals() {
		if (!this.intervals) {
			this.intervals = this.graph.getIntervalsInOrder(
				this.settings.interval,
				this.settings.from,
			);
		}

		return this.intervals;
	}

	subSelect(subSelector: GraphSelectionSubSettings): GraphSelection {
		// TODO: manage the intervals of a sub select
		return new GraphSelection(
			this.graph,
			Object.assign({}, this.settings, subSelector),
			this,
			this.sorted,
		);
	}

	top(count: number): GraphSelection {
		if (!this.sorted) {
			throw new Error('sort first');
		}

		return new GraphSelection(
			this.graph,
			Object.assign({}, this.settings, {top: count}),
			this,
			this.sorted,
		);
	}

	bottom(count: number): GraphSelection {
		if (!this.sorted) {
			throw new Error('sort first');
		}

		return new GraphSelection(
			this.graph,
			Object.assign({}, this.settings, {bottom: count}),
			this,
			this.sorted,
		);
	}

	extremes() {
		if (!this.sorted) {
			throw new Error('sort first');
		}

		const top = this.nodes[0];
		const bottom = this.nodes[this.nodes.length - 1];

		return {
			top,
			bottom,
		};
	}

	sort(nodeCompare: string | GraphSelectionComparator): void {
		const interval = this.settings.interval;

		if (typeof nodeCompare === 'string') {
			const field = nodeCompare;
			nodeCompare = (weightsA, weightsB) =>
				weightsA.get(field) - weightsB.get(field);
		}

		this.nodes.sort((nodeA, nodeB) =>
			(<GraphSelectionComparator>nodeCompare)(
				nodeA.getWeights(interval),
				nodeB.getWeights(interval),
			),
		);
		this.sorted = true;
	}

	rank(nodeCompare: GraphSelectionComparator) {
		// TODO: a way to use tags rather than this?
		const intervals = this.getIntervals();
		const scores = this.nodes.reduce((map, node) => {
			const score = intervals.reduce((score, interval) => {
				// go through all the intervals, figure out
				// which other edges and my own edge should
				// be compared
				const related = node.getRelated(interval, this.settings.tag);

				return (
					score +
					related.reduce(
						// run edge compare, compute a score
						(sum, otherNode) =>
							sum +
							nodeCompare(
								node.getWeights(interval),
								otherNode.getWeights(interval),
							),
						0,
					)
				);
			}, 0);

			map.set(node, score);

			return map;
		}, new Map());

		this.nodes.sort((nodeB, nodeA) => {
			let sum = 0;

			const events = nodeA.getEvents(nodeB, intervals);
			// direct comparison
			for (const event of events) {
				if (
					nodeCompare(
						nodeA.getWeights(event.interval),
						nodeB.getWeights(event.interval),
					) > 0
				) {
					sum += 1;
				} else {
					sum -= 1;
				}
			}

			// if there's no connections or do direct diff, use the ranks
			if (sum === 0) {
				const rankA = scores.get(nodeA);
				const rankB = scores.get(nodeB);

				if (rankA > rankB) {
					return 1;
				} else if (rankA < rankB) {
					return -1;
				} else {
					// Best effort to compare.  At this point they've either split games,
					// or never played and have the same general rank.  I need to do this
					// so it'd deterministc, since 0 would maintain the original rank
					const interval = intervals[intervals.length - 1];

					return nodeCompare(
						nodeA.getWeights(interval),
						nodeB.getWeights(interval),
					);
				}
			} else {
				return sum;
			}
		});

		this.sorted = true;
	}

	setPositionAsWeight(mount: string) {
		const arr = this.nodes;

		if (arr.length) {
			const length = arr.length;
			for (let i = 1, c = length; i < c; i++) {
				arr[i].setWeight(this.settings.interval, mount, length - i);
			}
		}
	}

	bucket(mount: string, bucketCount: number) {
		const arr = this.nodes;

		if (arr.length) {
			const limit = Math.floor(arr.length / bucketCount);

			arr[0].setWeight(this.settings.interval, mount, bucketCount);
			for (let i = 1, c = arr.length; i < c; i++) {
				if (i % limit === 0) {
					bucketCount--;
				}

				arr[i].setWeight(this.settings.interval, mount, bucketCount);
			}
		}
	}

	eachInterval(fn: (node: Weights, edge: Weights, prev: Weights) => void) {
		const nodes = this.nodes;
		const intervals = this.getIntervals();

		for (const node of nodes) {
			// TODO: figure out previous interval if possible
			const previous = this.graph.getIntervalBefore(intervals[0]);

			let prev = previous ? node.getWeights(previous) : null;
			for (const interval of intervals) {
				const cur = node.getWeights(interval);

				if (node.hasEdge(interval)) {
					fn(cur, node.getEdge(interval), prev);
				}

				prev = cur;
			}
		}
	}

	transfer(from: string, to?: string) {
		if (!to) {
			to = from;
		}

		this.eachInterval((nodeWeights, edgeWeights) => {
			nodeWeights.set(to, edgeWeights.get(from));
		});
	}

	toJSON(mount = null) {
		if (mount) {
			return {
				selected: this.nodes.map((node) => ({
					reference: node.ref,
					value: node.getWeight(this.settings.interval, mount),
				})),
			};
		} else {
			return {
				selected: this.nodes.map((node) => node.ref),
			};
		}
	}
}
