import { expect } from 'chai';
import {Node} from './node';

describe('@bmoor/graph::node', function(){
    let root = null;
    let level1_a = null;
    let level1_b = null;
    let level2_a_a = null;
    let level2_a_b = null;
    let level2_b_a = null;
    let level2_b_b = null;

    beforeEach(function(){
        root = new Node('team', 'team');
        level1_a = new Node('group-1', 'group', root);
        level1_b = new Node('group-2', 'group', root);
        level2_a_a = new Node('player-1', 'player', level1_a);
        level2_a_b = new Node('player-2', 'player', level1_a);
        level2_b_a = new Node('player-3', 'player', level1_b);
        level2_b_b = new Node('player-4', 'player', level1_b);
    });

    /**
    * I want to be able to bubble total stats up from player -> position group -> team
    */
    describe('::bubble', function(){
        it('should work', function(){
            const interval = 'pos-0';

            level2_a_a.setWeight(interval, 'value', 10);

            level2_a_b.setWeight(interval, 'value', 20);

            level2_b_a.setWeight(interval, 'value', 30);

            level2_b_b.setWeight(interval, 'value', 40);

            function bubble(parentWeights, childWeights){
                parentWeights.sum('value', childWeights.get('value'));
            }

            level2_a_a.bubble(interval, bubble);
            level2_a_b.bubble(interval, bubble);
            level2_b_a.bubble(interval, bubble);
            level2_b_b.bubble(interval, bubble);

            expect(root.getWeight(interval, 'value')).to.equal(null);
            expect(level1_a.getWeight(interval, 'value')).to.equal(30);
            expect(level1_b.getWeight(interval, 'value')).to.equal(70);
        });

        it('should work expectedly incorrectly', function(){
            const interval = 'pos-0';

            level2_a_a.setWeight(interval, 'value', 10);

            level2_a_b.setWeight(interval, 'value', 20);

            level2_b_a.setWeight(interval, 'value', 30);

            level2_b_b.setWeight(interval, 'value', 40);

            function bubble(parentWeights, childWeights){
                parentWeights.sum('value', childWeights.get('value'));
            }

            level2_a_a.bubble(interval, bubble, true);
            level2_a_b.bubble(interval, bubble, true);
            level2_b_a.bubble(interval, bubble, true);
            level2_b_b.bubble(interval, bubble, true);

            expect(root.getWeight(interval, 'value')).to.equal(140);
            expect(level1_a.getWeight(interval, 'value')).to.equal(30);
            expect(level1_b.getWeight(interval, 'value')).to.equal(70);
        });
    });

    describe('::pull', function(){
        it('should work', function(){
            const interval = 'pos-0';

            level2_a_a.setWeight(interval, 'value', 10);

            level2_a_b.setWeight(interval, 'value', 20);

            level2_b_a.setWeight(interval, 'value', 30);

            level2_b_b.setWeight(interval, 'value', 40);

            function bubble(parentWeights, childWeights){
                parentWeights.sum('value', childWeights.get('value'));
                parentWeights.sum('count', childWeights.get('count', 1));
            }

            root.pull(interval, bubble);

            expect(root.getWeight(interval, 'value')).to.equal(100);
            expect(root.getWeight(interval, 'count')).to.equal(4);
            expect(level1_a.getWeight(interval, 'value')).to.equal(30);
            expect(level1_b.getWeight(interval, 'value')).to.equal(70);
        });
    });

    describe('::trickle', function(){
        it('should work', function(){
            const interval = 'pos-0';

            root.setWeight(interval, 'value', 10);

            function fn(child, parent){
                child.set('value', parent.get('value'));
            }

            root.trickle(interval, fn);

            expect(level2_a_a.getWeight(interval, 'value')).to.equal(10);
            expect(level2_a_b.getWeight(interval, 'value')).to.equal(10);
            expect(level2_b_a.getWeight(interval, 'value')).to.equal(10);
            expect(level2_b_b.getWeight(interval, 'value')).to.equal(10);
        });
    });
});