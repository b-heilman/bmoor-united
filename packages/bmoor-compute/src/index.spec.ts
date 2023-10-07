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
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-1-2': {
							features: {
								foo: 201,
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
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-2-2': {
							features: {
								foo: 210,
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
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-1-2': {
							features: {
								foo: 202,
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
							},
							metadata: {
								type: 'p',
								position: 'p-1',
							},
						},
						'g-2-2': {
							features: {
								foo: 220,
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
					},
				},
				'g-2': {
					features: {
						foo: 30,
					},
				},
			},
			fier: {
				'g-1': {
					features: {
						foo: 4,
					},
				},
				'g-2': {
					features: {
						foo: 40,
					},
				},
			},
			funf: {
				'g-1': {
					features: {
						foo: 5,
					},
				},
				'g-2': {
					features: {
						foo: 50,
					},
				},
			},
			sechs: {
				'g-1': {
					features: {
						foo: 6,
					},
				},
				'g-2': {
					features: {
						foo: 60,
					},
				},
			},
			sieben: {
				'g-1': {
					features: {
						foo: 7,
					},
				},
				'g-2': {
					features: {
						foo: 70,
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
					accessor: accessFoo,
					offset: -1,
				},
				{
					accessor: accessFoo,
					offset: -2,
				},
			],
		);

		proc2 = new Processor('mean-3', mean, [
			{
				accessor: accessFoo,
				range: 3,
			},
		]);

		proc3 = new Processor(
			'compared-means',
			(data: {arg1: number; arg2: number}) => (data.arg1 + data.arg2) / 2,
			[
				{
					offset: -2,
					accessor: new Accessor({
						arg1: proc1,
						arg2: proc2,
					}),
				},
			],
		);

		proc4 = new Processor('p-means', mean, [
			{
				accessor: accessFoo,
				select: {
					metadata: {
						type: 'p',
					},
				},
			},
		]);

		proc5 = new Processor('p-proc', mean, [
			{
				accessor: new Accessor({value: proc2}),
				select: {
					metadata: {
						type: 'p',
					},
				},
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
});
