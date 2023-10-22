import {expect} from 'chai';

import {Interval, Order} from './environment';
import {
	DatumAccessor,
	DatumProcessor,
	DatumSelector,
	Environment,
	EnvironmentSelector,
	Executor,
	mean,
} from './index';

class Accessor extends DatumAccessor<DatumSelector, Interval> {}

class Processor extends DatumProcessor<DatumSelector, Interval> {}

describe('@bmoor/compute', function () {
	let env: Environment = null;
	let executor: Executor<
		EnvironmentSelector,
		DatumSelector,
		Interval,
		Order
	>;

	let accessFoo;
	let proc1;
	let proc2;
	let proc3;
	let proc4;
	let proc5;
	let proc6;
	let proc7;

	beforeEach(function () {
		env = new Environment({
			eins: {
				'g-1': {
					features: {
						foo: 1,
					},
					children: {
						'g-1-1': {
							features: {
								foo: 101,
								bar: 101.5,
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-1-2': {
							features: {
								foo: 201,
								bar: 201.5,
							},
							metadata: {
								type: 'p',
								position: 'p-2',
							},
						},
					},
				},
				'g-2': {
					features: {
						foo: 10,
					},
					children: {
						'g-2-1': {
							features: {
								foo: 110,
								bar: 110.5,
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-2-2': {
							features: {
								foo: 210,
								bar: 210.5,
							},
							metadata: {
								type: 'p',
								position: 'p-2',
							},
						},
					},
				},
			},
			zwei: {
				'g-1': {
					features: {
						foo: 2,
					},
					children: {
						'g-1-1': {
							features: {
								foo: 102,
								bar: 102.5,
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-1-2': {
							features: {
								foo: 202,
								bar: 202.5,
							},
							metadata: {
								type: 'p',
								position: 'p-2',
							},
						},
					},
				},
				'g-2': {
					features: {
						foo: 20,
					},
					children: {
						'g-2-1': {
							features: {
								foo: 120,
								bar: 120.5,
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-2-2': {
							features: {
								foo: 220,
								bar: 220.5,
							},
							metadata: {
								type: 'p',
								position: 'p-2',
							},
						},
					},
				},
			},
			drei: {
				'g-1': {
					features: {
						foo: 3,
						bar: 3.5,
					},
				},
				'g-2': {
					features: {
						foo: 30,
						bar: 30.5,
					},
				},
			},
			fier: {
				'g-1': {
					features: {
						foo: 4,
						bar: 4.5,
					},
				},
				'g-2': {
					features: {
						foo: 40,
						bar: 40.5,
					},
				},
			},
			funf: {
				'g-1': {
					features: {
						foo: 5,
						bar: 5.5,
					},
				},
				'g-2': {
					features: {
						foo: 50,
						bar: 50.5,
					},
				},
			},
			sechs: {
				'g-1': {
					features: {
						foo: 6,
						bar: 6.5,
					},
				},
				'g-2': {
					features: {
						foo: 60,
						bar: 60.5,
					},
				},
			},
			sieben: {
				'g-1': {
					features: {
						foo: 7,
						bar: 7.5,
					},
				},
				'g-2': {
					features: {
						foo: 70,
						bar: 70.5,
					},
				},
			},
		});

		executor = new Executor<
			EnvironmentSelector,
			DatumSelector,
			Interval,
			Order
		>(env);

		accessFoo = new Accessor({value: 'foo'});

		// bar1

		proc1 = new Processor(
			'mean-between',
			(arg1: {value: number}, arg2: {value: number}) => {
				return (arg1.value + arg2.value) / 2;
			},
			[
				{
					input: accessFoo,
					offset: -1,
				},
				{
					input: accessFoo,
					offset: -2,
				},
			],
		);

		proc2 = new Processor('mean-3', mean, [
			{
				input: accessFoo,
				range: 3,
			},
		]);

		proc3 = new Processor(
			'compared-means',
			(data: {arg1: number; arg2: number}) => (data.arg1 + data.arg2) / 2,
			[
				{
					offset: -2,
					input: new Accessor({
						arg1: proc1,
						arg2: proc2,
					}),
				},
			],
		);

		proc4 = new Processor('p-means', mean, [
			{
				input: accessFoo,
				select: {
					metadata: {
						type: 'p',
					},
				},
			},
		]);

		proc5 = new Processor('p-proc', mean, [
			{
				input: proc2,
				select: {
					metadata: {
						type: 'p',
					},
				},
			},
		]);

		proc6 = new Processor(
			'cross',
			(inputs: {foo: number; bar: number}[]) => {
				return (
					inputs.reduce(
						(agg, input) => agg + (input.foo + input.bar) / 2,
						0,
					) / inputs.length
				);
			},
			[
				{
					input: new Accessor({
						foo: 'foo',
						bar: 'bar',
					}),
					select: {
						metadata: {
							type: 'p',
						},
					},
				},
			],
		);

		proc7 = new Processor('range', mean, [
			{
				input: proc6,
				range: 3,
			},
		]);
	});

	it('should work with a simple execution', async function () {
		// access
		const v = await executor.calculate(
			{ref: 'drei', order: 0},
			accessFoo,
			{
				reference: 'g-1',
			},
		);
		expect(v).to.deep.equal([{value: 3}]);
	});

	it('should allow you to simply pick the other side', async function () {
		// access
		const v = await executor.calculate(
			{ref: 'drei', order: 0},
			accessFoo,
			{
				reference: 'g-2',
			},
		);
		expect(v).to.deep.equal([{value: 30}]);
	});

	it('should work with simple processor', async function () {
		// (10 + 20) / 2
		const v = await executor.calculate({ref: 'drei', order: 0}, proc1, {
			reference: 'g-2',
		});
		expect(v).to.deep.equal([15]);
	});

	it('should work with a range execution', async function () {
		// (2 + 3 + 4) / 3
		const v = await executor.calculate({ref: 'fier', order: 0}, proc2, {
			reference: 'g-1',
		});
		expect(v).to.deep.equal([3]);
	});

	it('should allow compound calls', async function () {
		// (((4 + 3) / 2) + ((5 + 4 + 3) / 3)) / 2
		const v = await executor.calculate({ref: 'sieben', order: 0}, proc3, {
			reference: 'g-1',
		});

		expect(v).to.deep.equal([3.75]);
	});

	it('should allow subcalls', async function () {
		const v = await executor.calculate({ref: 'eins', order: 0}, proc4, {
			reference: 'g-1',
		});

		expect(v).to.deep.equal([151]);
	});

	it('should allow compound subcalls', async function () {
		const v = await executor.calculate({ref: 'zwei', order: 0}, proc5, {
			reference: 'g-2',
		});

		expect(v).to.deep.equal([165]);
	});

	it.only('should allow more complex compound subcalls', async function () {
		const v = await executor.calculate({ref: 'zwei', order: 0}, proc7, {
			reference: 'g-2',
		});

		expect(v).to.deep.equal([165.25]);
	});
});
