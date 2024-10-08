import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Event} from './event';
import {Features} from './features';
import {Graph, load} from './graph';
import {GraphDatum} from './graph/datum';
import {Node} from './node';

describe('@bmoor/graph', function () {
	describe('Graph building', function () {
		it('should properly build a flat graph', function () {
			const graph = new Graph((node) => new GraphDatum(node, graph));

			const node1 = new Node('node-1');
			const node2 = new Node('node-2');
			const node3 = new Node('node-3');
			const node4 = new Node('node-4');

			graph.addNode(node1);
			graph.addNode(node2);
			graph.addNode(node3);
			graph.addNode(node4);

			function biConnectNodes(
				eventFeatures: Features,
				node1: Node,
				features1: Features,
				node2: Node,
				features2: Features,
			) {
				const event = new Event(
					node1.ref + ':' + node2.ref,
					eventFeatures,
				);

				event.setNodeFeatures(node1, features1);
				event.setNodeFeatures(node2, features2);

				graph.addEvent(event);
			}

			biConnectNodes(
				new Features({
					general: 1,
				}),
				node1,
				new Features({
					value: 1,
				}),
				node2,
				new Features({
					value: 2,
				}),
			);

			biConnectNodes(
				new Features({
					general: 2,
				}),
				node3,
				new Features({
					value: 3,
				}),
				node4,
				new Features({
					value: 4,
				}),
			);

			expect(graph.toJSON()).to.deep.equal({
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'node-1',
						type: '__DEFAULT__',
					},
					{
						ref: 'node-2',
						type: '__DEFAULT__',
					},
					{
						ref: 'node-3',
						type: '__DEFAULT__',
					},
					{
						ref: 'node-4',
						type: '__DEFAULT__',
					},
				],
				events: [
					{
						ref: 'node-1:node-2',
						features: {
							general: 1,
						},
						connections: [
							{
								nodeRef: 'node-1',
								features: {
									value: 1,
								},
							},
							{
								nodeRef: 'node-2',
								features: {
									value: 2,
								},
							},
						],
					},
					{
						ref: 'node-3:node-4',
						features: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'node-3',
								features: {
									value: 3,
								},
							},
							{
								nodeRef: 'node-4',
								features: {
									value: 4,
								},
							},
						],
					},
				],
			});
		});

		it('should properly build a tiered graph', function () {
			const graph = new Graph((node) => new GraphDatum(node, graph));

			const nodeA = new Node('node-a');
			const node1 = new Node('node-1');
			const node2 = new Node('node-2');
			const nodeB = new Node('node-b');
			const node3 = new Node('node-3');
			const node4 = new Node('node-4');

			node1.setParent(nodeA);
			node2.setParent(nodeA);
			node3.setParent(nodeB);
			node4.setParent(node3);

			graph.addNode(nodeA);
			graph.addNode(node1);
			graph.addNode(node2);
			graph.addNode(nodeB);
			graph.addNode(node3);
			graph.addNode(node4);

			nodeA.addEdge('opponent', nodeB);
			nodeB.addEdge('opponent', nodeA);

			expect(graph.toJSON()).to.deep.equal({
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'node-a',
						type: '__DEFAULT__',
						edges: {
							opponent: ['node-b'],
						},
					},
					{
						ref: 'node-1',
						type: '__DEFAULT__',
						parentRef: 'node-a',
					},
					{
						ref: 'node-2',
						type: '__DEFAULT__',
						parentRef: 'node-a',
					},
					{
						ref: 'node-b',
						type: '__DEFAULT__',
						edges: {
							opponent: ['node-a'],
						},
					},
					{
						ref: 'node-3',
						type: '__DEFAULT__',
						parentRef: 'node-b',
					},
					{
						ref: 'node-4',
						type: '__DEFAULT__',
						parentRef: 'node-3',
					},
				],
				events: [],
			});
		});
	});

	describe('Graph::select', function () {
		const ctx = new Context({});
		const graph = load(
			ctx,
			{
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'node-a',
						type: 'team',
						edges: {
							opponent: ['node-b'],
						},
					},
					{
						ref: 'node-1',
						type: 'position',
						metadata: {
							which: 'wr',
						},
						parentRef: 'node-a',
					},
					{
						ref: 'node-2',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'node-a',
					},
					{
						ref: 'node-b',
						type: 'team',
						edges: {
							opponent: ['node-a'],
						},
					},
					{
						ref: 'node-3',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'node-b',
					},
					{
						ref: 'node-4',
						type: 'player',
						parentRef: 'node-3',
					},
				],
				events: [],
			},
			(root) => {
				/**
				 * Type script refuses to allow me to do this in any way other this
				 * this ugly shit.  This language used to be nice, now it's just a worse
				 * version of Java
				 */
				const t = new Graph((node) => new GraphDatum(node, t), root);
				return t;
			},
		);

		it('should allow selections combined with .and', function () {
			const select1 = graph.select(graph.getDatum('node-a'), {
				type: 'position',
				metadata: {
					which: 'qb',
				},
				and: [
					{
						type: 'position',
						metadata: {
							which: 'wr',
						},
					},
				],
			});

			expect(select1.map((datum) => datum.node.ref)).to.deep.equal([
				'node-2',
				'node-1',
			]);
		});

		it('should allow selection with .type', function () {
			const select1 = graph.select(graph.getDatum('node-a'), {
				type: 'position',
			});

			const select2 = graph.select(null, {
				type: 'position',
			});

			expect(select1.map((datum) => datum.node.ref)).to.deep.equal([
				'node-1',
				'node-2',
			]);

			expect(select2.map((datum) => datum.node.ref)).to.deep.equal([
				'node-1',
				'node-2',
				'node-3',
			]);
		});

		it('should work with .parent', function () {
			const select1 = graph.select(graph.getDatum('node-a'), {
				parent: 'team',
			});
			const select2 = graph.select(null, {
				type: 'player',
				parent: 'team',
			});
			const select3 = graph.select(null, {
				type: 'position',
				parent: 'team',
			});

			expect(select1.map((datum) => datum.node.ref)).to.deep.equal([
				'node-a',
			]);
			expect(select2.map((datum) => datum.node.ref)).to.deep.equal([
				'node-b',
			]);
			expect(select3.map((datum) => datum.node.ref)).to.deep.equal([
				'node-a',
				'node-b',
			]);
		});

		it('should work with .sibling', function () {
			const select1 = graph.select(graph.getDatum('node-1'), {
				sibling: 'position',
			});

			expect(select1.map((datum) => datum.node.ref)).to.deep.equal([
				'node-2',
			]);
		});

		it('should work with .metadata', function () {
			const select1 = graph.select(null, {
				type: 'position',
				metadata: {
					which: 'qb',
				},
			});

			expect(select1.map((datum) => datum.node.ref)).to.deep.equal([
				'node-2',
				'node-3',
			]);
		});

		it('should work with .edge', function () {
			const select1 = graph.select(graph.getDatum('node-b'), {
				edge: 'opponent',
			});
			const select2 = graph.select(graph.getDatum('node-b'), {
				edge: 'opponent',
				type: 'position',
			});

			expect(select1.map((datum) => datum.node.ref)).to.deep.equal([
				'node-a',
			]);
			expect(select2.map((datum) => datum.node.ref)).to.deep.equal([
				'node-1',
				'node-2',
			]);
		});
	});

	describe('Graph::getEventFeatures', function () {
		const ctx = new Context({});
		const graph = load(
			ctx,
			{
				root: {
					ref: '__root__',
					type: 'root',
				},
				nodes: [
					{
						ref: 'node-a',
						type: 'team',
					},
					{
						ref: 'node-1',
						type: 'position',
						metadata: {
							which: 'wr',
						},
						parentRef: 'node-a',
					},
					{
						ref: 'node-2',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'node-a',
					},
					{
						ref: 'node-b',
						type: 'team',
					},
					{
						ref: 'node-3',
						type: 'position',
						metadata: {
							which: 'qb',
						},
						parentRef: 'node-b',
					},
					{
						ref: 'node-4',
						type: 'player',
						parentRef: 'node-3',
					},
				],
				events: [
					{
						ref: 'node-1:node-2',
						features: {
							general: 1,
						},
						connections: [
							{
								nodeRef: 'node-1',
								features: {
									value: 1,
								},
							},
							{
								nodeRef: 'node-2',
								features: {
									value: 2,
								},
							},
						],
					},
					{
						ref: 'node-3:node-4',
						features: {
							general: 2,
						},
						connections: [
							{
								nodeRef: 'node-3',
								features: {
									value: 3,
								},
							},
							{
								nodeRef: 'node-4',
								features: {
									value: 4,
								},
							},
						],
					},
				],
			},
			(node) => {
				const t = new Graph((node) => new GraphDatum(node, t), node);
				return t;
			},
		);

		it('should allow selection', function () {
			const select1 = graph.getEventFeatures('node-1');

			expect(
				select1.map((event) => ({
					eventFeatures: event.eventFeatures.toJSON(),
					nodeFeatures: event.nodeFeatures.toJSON(),
				})),
			).to.deep.equal([
				{
					eventFeatures: {
						general: 1,
					},
					nodeFeatures: {
						value: 1,
					},
				},
			]);
		});
	});
});
