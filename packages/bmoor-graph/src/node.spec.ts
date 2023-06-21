import {expect} from 'chai';

import {Edge} from './edge';
import {Node} from './node';
import {NodeValueSelector} from './node.interface';
import {Weights} from './weights';

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
		level1_a = new Node('group-1', 'group').setParent(root);
		level1_b = new Node('group-2', 'group').setParent(root);
		level2_a_a = new Node('player-1', 'player').setParent(level1_a);
		level2_a_b = new Node('player-2', 'player').setParent(level1_a);
		level2_b_a = new Node('player-3', 'player').setParent(level1_b);
		level2_b_b = new Node('player-4', 'player').setParent(level1_b);
	});

	describe('::getValue', function () {
		it('should allow you to get values from the node itself', async function () {
			root.setWeight('value', 123);

			expect(
				await root.getValue('value', NodeValueSelector.node),
			).to.deep.equal(123);
		});

		it('should allow you to get values from the node edges', async function () {
			const edge = new Edge('foo-bar', new Weights({}));

			edge.addNodeWeight(
				root,
				new Weights({
					'hello-world': 456,
				}),
			);

			root.addEdge(edge);

			expect(
				await root.getValue('hello-world', NodeValueSelector.edge),
			).to.deep.equal(456);
		});

		it('should allow you to get many values from the node edges', async function () {
			const edge = new Edge('foo-bar', new Weights({}));

			edge.addNodeWeight(
				root,
				new Weights({
					'hello-world': 123,
				}),
			);

			root.addEdge(edge);

			const edge2 = new Edge('hello-world', new Weights({}));

			edge2.addNodeWeight(
				root,
				new Weights({
					'hello-world': 456,
				}),
			);

			root.addEdge(edge2);

			expect(
				await root.getValue('hello-world', NodeValueSelector.edge),
			).to.deep.equal(579);
		});
	});

	describe('::getChildren', function () {
		it('should work', function () {
			const select1 = root.getChildren({type: 'player'});
			const select2 = root.getChildren({type: 'player'}, true);
			const select3 = level1_a.getChildren({type: 'player'}, true);

			expect(select1.map((node) => node.ref)).to.deep.equal([]);
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

			function bubble(parentWeights, childWeights) {
				parentWeights.sum('value', childWeights.get('value'));
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

			function bubble(parentWeights, childWeights) {
				parentWeights.sum('value', childWeights.get('value'));
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

			function bubble(parentWeights, childWeights) {
				parentWeights.sum('value', childWeights.get('value'));
				parentWeights.sum('count', childWeights.get('count', 1));
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
