import {expect} from 'chai';

import {ActionRange} from './action/range';
import {ActionRequire} from './action/require';
import {ActionSelect} from './action/select';
import {Environment, Interval, Order, Selector} from './environment';
import {Executor} from './executor';
import {Registry} from './index';

class Select extends ActionSelect<Selector, Interval> {}

class Require extends ActionRequire<Selector, Interval> {}

class Range extends ActionRange<Selector, Interval> {}

describe('@bmoor/compute', function () {
	let env = null;
	let registry = null;
	let executor = null;

	let foo = null;
	let bar1 = null;
	let bar2 = null;
	let calc1 = null;

	beforeEach(function () {
		env = new Environment({
			eins: {
				'g-1': {
					foo: 1,
				},
				'g-2': {
					foo: 10,
				},
			},
			zwei: {
				'g-1': {
					foo: 2,
				},
				'g-2': {
					foo: 20,
				},
			},
			drei: {
				'g-1': {
					foo: 3,
				},
				'g-2': {
					foo: 30,
				},
			},
			fier: {
				'g-1': {
					foo: 4,
				},
				'g-2': {
					foo: 40,
				},
			},
			funf: {
				'g-1': {
					foo: 5,
				},
				'g-2': {
					foo: 50,
				},
			},
			sechs: {
				'g-1': {
					foo: 6,
				},
				'g-2': {
					foo: 60,
				},
			},
			sieben: {
				'g-1': {
					foo: 7,
				},
				'g-2': {
					foo: 70,
				},
			},
		});

		registry = new Registry<Selector, Interval>();

		executor = new Executor<Selector, Selector, Interval, Order>(
			env,
			registry,
		);

		// TODO: I don't need select if I allow
		//   executor to direcly read values
		foo = new Select('s:1', 'foo');

		bar1 = new Require('r:1');
		bar1
			.require({
				offset: -1,
				action: foo,
			})
			.require({
				offset: -2,
				feature: 'foo',
			})
			.then((arg1: number, arg2: number) => {
				return (arg1 + arg2) / 2;
			});

		registry.addAction(bar1);

		function fn1(vals: number[]) {
			const sum = vals.reduce((agg, val) => agg + val, 0);
			return sum / vals.length;
		}

		calc1 = new Range('range:3:0', 'foo', 3, fn1);
		registry.addAction(calc1);

		bar2 = new Require('r:2');
		bar2
			.require({
				offset: -2,
				action: bar1,
			})
			.require({
				offset: -2,
				action: calc1,
			})
			.then((arg1: number, arg2: number) => (arg1 + arg2) / 2);

		registry.addAction(bar2);
	});

	it('should work with a simple execution', async function () {
		// (1 + 2) / 2
		const v1 = await executor.calculate({ref: 'drei', order: 0}, 'r:1', {
			sub: 'g-1',
		});
		expect(v1).to.deep.equal([1.5]);
	});

	it('should allow you to simply pick the other side', async function () {
		// (10 + 20) / 2
		const v4 = await executor.calculate({ref: 'drei', order: 0}, 'r:1', {
			sub: 'g-2',
		});
		expect(v4).to.deep.equal([15]);
	});

	it('should work with a range execution', async function () {
		// (2 + 3 + 4) / 3
		const v2 = await executor.calculate(
			{ref: 'fier', order: 0},
			'range:3:0',
			{
				sub: 'g-1',
			},
		);
		expect(v2).to.deep.equal([3]);
	});

	it('should allow compound calls', async function () {
		// (((4 + 3) / 2) + ((5 + 4 + 3) / 3)) / 2
		const v3 = await executor.calculate({ref: 'sieben', order: 0}, 'r:2', {
			sub: 'g-1',
		});
		expect(v3).to.deep.equal([3.75]);
	});
});
