import {expect} from 'chai';

import {ActionRange} from './action/range';
import {ActionRequire} from './action/require';
import {ActionSelect} from './action/select';
import {Interval, Selector} from './environment';
import {Environment, Registry} from './index';

class Select extends ActionSelect<Interval, Selector> {}

class Require extends ActionRequire<Interval, Selector> {}

class Range extends ActionRange<Interval, Selector> {}

describe('@bmoor/compute', function () {
	it('should work', async function () {
		const env = new Environment({
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

		const registry = new Registry<Interval, Selector>(env);

		const foo = new Select('s:1', 'foo');

		const bar1 = new Require('r:1');
		bar1
			.require(-1, foo)
			.require(-2, foo)
			.then((arg1, arg2) => {
				return (arg1 + arg2) / 2;
			});

		registry.addAction(bar1);

		function fn1(vals: number[]) {
			const sum = vals.reduce((agg, val) => agg + val, 0);

			return sum / vals.length;
		}

		const calc1 = new Range('range:3:0', 'foo', 3, fn1);
		const calc2 = new Range('range:3:-1', 'foo', 3, fn1, -1);

		const bar3 = new Require('r:2');
		bar3
			.require(-2, bar1)
			.require(-2, calc1)
			.then((arg1, arg2) => (arg1 + arg2) / 2);

		registry.addAction(bar3);

		const foo2 = new Select('s:2', calc2, {sub: 'g-1'});

		registry.addAction(foo2);

		const bar4 = new Require('r:3');
		bar4
			.require(-2, bar1)
			.require(-1, foo2)
			.then((arg1, arg2) => (arg1 + arg2) / 2);

		registry.addAction(bar4);

		const calc3 = new Range(
			'range:3',
			'foo',
			2,
			function (values) {
				console.log('>', values[0], values[1]);
				return values[0] - values[1];
			},
			-1,
		);

		const calc4 = new Range('range:4', calc3, 3, function (values) {
			return values[0] - values[values.length - 1];
		});

		registry.addAction(calc4);

		// (1 + 2) / 2
		const v1 = await registry.calculate('drei', 'r:1', {
			sub: 'g-1',
		});
		expect(v1).to.equal(1.5);

		// (2 + 3 + 4) / 3
		const v2 = await registry.calculate('fier', 'range:3:0', {
			sub: 'g-1',
		});
		expect(v2).to.equal(3);

		// (1 + 2 + 3) / 3
		const v22 = await registry.calculate('fier', 'range:3:-1', {
			sub: 'g-1',
		});
		expect(v22).to.equal(2);

		const v23 = await registry.calculate('drei', 'range:3:-1', {
			sub: 'g-1',
		});
		expect(v23).to.equal(1.5);

		// (((4 + 3) / 2) + ((5 + 4 + 3) / 3)) / 2
		const v3 = await registry.calculate('sieben', 'r:2', {
			sub: 'g-1',
		});
		expect(v3).to.equal(3.75);

		// (10 + 20) / 2
		const v4 = await registry.calculate('drei', 'r:1', {
			sub: 'g-2',
		});
		expect(v4).to.equal(15);

		// (((40 + 30) / 2) + ((5 + 4 + 3) / 3)) / 2 => (35 + 4) / 2
		const v5 = await registry.calculate('sieben', 'r:3', {
			sub: 'g-2',
		});
		expect(v5).to.equal(19.5);

		// arr = [(3-4),(4-5),(5-6)] => (-1) - (-1)
		const v6 = await registry.calculate('sieben', 'range:4', {
			sub: 'g-1',
		});
		expect(v6).to.equal(0);
	});
});
