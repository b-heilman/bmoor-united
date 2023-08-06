import {expect} from 'chai';

import {Edge} from './edge';
import {Event} from './event';
import {Features} from './features';
import {Node} from './node';
import {NodeValueSelector} from './node.interface';

describe('@bmoor/graph::node', function () {
	let root: Node = null;
	let level1_a: Node = null;
	let level1_b: Node = null;
	let level2_a_a: Node = null;
	let level2_a_b: Node = null;
	let level2_b_a: Node = null;
	let level2_b_b: Node = null;

	beforeEach(function () {
		root = new Node('team', 'team');
		level1_a = new Node('group-1', 'group', {
			parent: root,
		});
		level1_b = new Node('group-2', 'group', {
			parent: root,
		});
		level2_a_a = new Node('player-1', 'player', {
			parent: level1_a,
			metadata: {
				pos: 'qb',
			},
		});
		level2_a_b = new Node('player-2', 'player', {
			parent: level1_a,
			metadata: {
				pos: 'rb',
			},
		});
		level2_b_a = new Node('player-3', 'player', {
			parent: level1_b,
			metadata: {
				pos: 'qb',
			},
		});
		level2_b_b = new Node('player-4', 'player', {
			parent: level1_b,
			metadata: {
				pos: 'rb',
			},
		});

		level1_a.addEdge(new Edge('opponent', level1_b));
		level1_b.addEdge(new Edge('opponent', level1_a));
	});

	describe('::getValue', function () {
		it('should allow you to get values from the node itself', async function () {
			root.setWeight('value', 123);

			expect(
				await root.getValue('value', NodeValueSelector.node),
			).to.deep.equal(123);
		});

		it('should allow you to get values from the node events', async function () {
			const event = new Event('foo-bar', new Features({}));

			event.setNodeFeatures(
				root,
				new Features({
					'hello-world': 456,
				}),
			);

			root.addEvent(event);

			expect(
				await root.getValue('hello-world', NodeValueSelector.event),
			).to.deep.equal(456);
		});

		it('should allow you to get many values from the node events', async function () {
			const event = new Event('foo-bar', new Features({}));

			event.setNodeFeatures(
				root,
				new Features({
					'hello-world': 123,
				}),
			);

			root.addEvent(event);

			const event2 = new Event('hello-world', new Features({}));

			event2.setNodeFeatures(
				root,
				new Features({
					'hello-world': 456,
				}),
			);

			root.addEvent(event2);

			expect(
				await root.getValue('hello-world', NodeValueSelector.event),
			).to.deep.equal(579);
		});
	});

	describe('::getChildren', function () {
		it('should work', function () {
			const select1 = root.getChildren(true);
			const select2 = level1_a.getChildren(true);

			expect(select1.map((node) => node.ref)).to.deep.equal([
				'group-1',
				'player-1',
				'player-2',
				'group-2',
				'player-3',
				'player-4',
			]);
			expect(select2.map((node) => node.ref)).to.deep.equal([
				'player-1',
				'player-2',
			]);
		});
	});

	describe('::select', function () {
		it('should work with .type', function () {
			const select2 = root.select({type: 'player'});
			const select3 = level1_a.select({type: 'player'});

			expect(select2.map((node) => node.ref)).to.deep.equal([
				'player-1',
				'player-2',
				'player-3',
				'player-4',
			]);
			expect(select3.map((node) => node.ref)).to.deep.equal([
				'player-1',
				'player-2',
			]);
		});

		it('should work with .parent', function () {
			const select1 = level2_a_a.select({
				parent: 'team',
				type: 'player',
			});
			const select2 = level2_a_a.select({
				parent: 'group',
				type: 'player',
			});

			expect(select1.map((node) => node.ref)).to.deep.equal([
				'player-1',
				'player-2',
				'player-3',
				'player-4',
			]);
			expect(select2.map((node) => node.ref)).to.deep.equal([
				'player-1',
				'player-2',
			]);
		});

		it('should work with .sibling', function () {
			const select1 = level2_a_a.select({
				parent: 'group',
				sibling: 'group',
				type: 'player',
			});
			const select2 = level2_a_a.select({
				sibling: 'player',
			});

			expect(select1.map((node) => node.ref)).to.deep.equal([
				'player-3',
				'player-4',
			]);
			expect(select2.map((node) => node.ref)).to.deep.equal(['player-2']);
		});

		it('should work with .metadata', function () {
			const select1 = level2_a_a.select({
				parent: 'group',
				sibling: 'group',
				type: 'player',
				metadata: {
					pos: 'qb',
				},
			});
			const select2 = level2_a_a.select({
				sibling: 'player',
				metadata: {
					pos: 'qb',
				},
			});

			expect(select1.map((node) => node.ref)).to.deep.equal(['player-3']);
			expect(select2.map((node) => node.ref)).to.deep.equal([]);
		});

		it('should work with .edge', function () {
			const select1 = level2_a_a.select({
				parent: 'group',
				edge: 'opponent',
				type: 'player',
				metadata: {
					pos: 'qb',
				},
			});
			const select2 = level2_a_a.select({
				sibling: 'player',
				edge: 'opponent',
			});

			expect(select1.map((node) => node.ref)).to.deep.equal(['player-3']);
			expect(select2.map((node) => node.ref)).to.deep.equal([]);
		});
	});

	/**
	 * I want to be able to bubble total stats up from player -> position group -> team
	 */
	describe('::bubble', function () {
		it('should work', function () {
			level2_a_a.setWeight('value', 10);

			level2_a_b.setWeight('value', 20);

			level2_b_a.setWeight('value', 30);

			level2_b_b.setWeight('value', 40);

			function bubble(parentFeatures, childFeatures) {
				parentFeatures.sum('value', childFeatures.get('value'));
			}

			level2_a_a.bubble(bubble);
			level2_a_b.bubble(bubble);
			level2_b_a.bubble(bubble);
			level2_b_b.bubble(bubble);

			expect(root.getWeight('value')).to.equal(null);
			expect(level1_a.getWeight('value')).to.equal(30);
			expect(level1_b.getWeight('value')).to.equal(70);
		});

		it('should work expectedly incorrectly', function () {
			level2_a_a.setWeight('value', 10);

			level2_a_b.setWeight('value', 20);

			level2_b_a.setWeight('value', 30);

			level2_b_b.setWeight('value', 40);

			function bubble(parentFeatures, childFeatures) {
				parentFeatures.sum('value', childFeatures.get('value'));
			}

			level2_a_a.bubble(bubble, true);
			level2_a_b.bubble(bubble, true);
			level2_b_a.bubble(bubble, true);
			level2_b_b.bubble(bubble, true);

			expect(root.getWeight('value')).to.equal(140);
			expect(level1_a.getWeight('value')).to.equal(30);
			expect(level1_b.getWeight('value')).to.equal(70);
		});
	});

	describe('::pull', function () {
		it('should work', function () {
			level2_a_a.setWeight('value', 10);

			level2_a_b.setWeight('value', 20);

			level2_b_a.setWeight('value', 30);

			level2_b_b.setWeight('value', 40);

			function bubble(parentFeatures, childFeatures) {
				parentFeatures.sum('value', childFeatures.get('value'));
				parentFeatures.sum('count', childFeatures.get('count', 1));
			}

			root.pull(bubble);

			expect(root.getWeight('value')).to.equal(100);
			expect(root.getWeight('count')).to.equal(4);
			expect(level1_a.getWeight('value')).to.equal(30);
			expect(level1_b.getWeight('value')).to.equal(70);
		});
	});

	describe('::trickle', function () {
		it('should work', function () {
			root.setWeight('value', 10);

			function fn(child, parent) {
				child.set('value', parent.get('value'));
			}

			root.trickle(fn);

			expect(level2_a_a.getWeight('value')).to.equal(10);
			expect(level2_a_b.getWeight('value')).to.equal(10);
			expect(level2_b_a.getWeight('value')).to.equal(10);
			expect(level2_b_b.getWeight('value')).to.equal(10);
		});
	});
});
