import {expect} from 'chai';

import {Interval, Order} from './environment';
import {
	DatumAccessor,
	DatumProcessor,
	DatumRanker,
	DatumSelector,
	Environment,
	EnvironmentSelector,
	Executor,
	mean,
} from './index';

class Accessor extends DatumAccessor<DatumSelector, Interval> {}

class Processor<Types> extends DatumProcessor<
	DatumSelector,
	Interval,
	Types
> {}

class Ranker<Types> extends DatumRanker<DatumSelector, Interval, Types> {}

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
					metadata: {
						type: 'u',
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
					metadata: {
						type: 'u',
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

		proc1 = new Processor<{eins: {value: number}; zwei: {value: number}}>(
			'mean-between',
			(args) => {
				return (args.eins.value + args.zwei.value) / 2;
			},
			{
				eins: {
					input: accessFoo,
					offset: -1,
				},
				zwei: {
					input: accessFoo,
					offset: -2,
				},
			},
		);

		proc2 = new Processor<{mean: number[]}>('mean-3', mean, {
			mean: {
				input: accessFoo,
				range: 3,
			},
		});

		proc3 = new Processor<{data: {arg1: number; arg2: number}}>(
			'compared-means',
			({data}) => (data.arg1 + data.arg2) / 2,
			{
				data: {
					offset: -2,
					input: new Accessor({
						arg1: proc1,
						arg2: proc2,
					}),
				},
			},
		);

		proc4 = new Processor('p-means', mean, {
			mean: {
				input: accessFoo,
				select: {
					metadata: {
						type: 'p',
					},
				},
			},
		});

		proc5 = new Processor('p-proc', mean, {
			mean: {
				input: proc2,
				select: {
					metadata: {
						type: 'p',
					},
				},
			},
	});

		proc6 = new Processor<{inputs: {foo: number, bar: number}[]}>(
			'cross',
			({inputs}: {inputs: {foo: number; bar: number}[]}) => {
				return (
					inputs.reduce(
						(agg, input) => agg + (input.foo + input.bar) / 2,
						0,
					) / inputs.length
				);
			},
			{
				inputs: {
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
			},
		);

		proc7 = new Processor('range', mean, {
			mean: {
				input: proc6,
				range: 3,
			},
		});
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

	it('should allow more complex compound subcalls', async function () {
		const v = await executor.calculate({ref: 'zwei', order: 0}, proc7, {
			reference: 'g-2',
		});

		expect(v).to.deep.equal([165.25]);
	});

	it('should allow ranking across nodes', async function () {
		const rank = new Ranker<{foo: number}>(
			'rank-across-foo',
			{
				select: {
					parent: {
						type: 'u',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			(input: {foo: number}) => {
				return input.foo;
			},
			{
				rank: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([2]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([1]);
	});

	it('should globally allow ranking across nodes', async function () {
		const rank = new Ranker(
			'rank-across-foo',
			{
				select: {
					parent: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			({input}: {input: {foo: number}}) => {
				return input.foo;
			},
			{
				input: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([4]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([2]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([1]);
	});

	it('should allow ranking ascending across nodes', async function () {
		const rank = new Ranker(
			'rank-across-foo',
			{
				asc: true,
				select: {
					parent: {
						type: 'u',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			({input}: {input: {foo: number}}) => {
				return input.foo;
			},
			{
				input: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([1]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([2]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([2]);
	});

	it('should allow ranking in buckets - bucket count', async function () {
		const rank = new Ranker(
			'rank-global-foo',
			{
				bucketsCount: 2,
				select: {
					parent: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			({input}: {input: {foo: number}}) => {
				return input.foo;
			},
			{
				input: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([2]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([1]);

		const v4 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-1',
		});

		expect(v4).to.deep.equal([2]);
	});

	it('should allow ranking in buckets - bucket size', async function () {
		const rank = new Ranker(
			'rank-global-foo',
			{
				asc: true,
				bucketSize: 3,
				select: {
					parent: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			({input}: {input: {foo: number}}) => {
				return input.foo;
			},
			{
				input: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([1]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([2]);

		const v4 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-1',
		});

		expect(v4).to.deep.equal([1]);
	});

	it('should allow ranking in buckets - with a filter', async function () {
		const rank = new Ranker(
			'rank-global-foo',
			{
				asc: true,
				bucketsCount: 2,
				filter: {
					fn: (input) => {
						const value = <number>input;
						return value > 105;
					},
					droppedValue: 3,
				},
				select: {
					parent: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			({input}: {input: {foo: number}}) => {
				return input.foo;
			},
			{
				input: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([3]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([2]);

		const v4 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-1',
		});

		expect(v4).to.deep.equal([1]);
	});

	it('should allow ranking in buckets - with stats', async function () {
		const rank = new Ranker(
			'rank-global-foo',
			{
				asc: true,
				bucketsCount: 2,
				filter: {
					stats: () => ({limit: 105}),
					// TODO: fix this nonsense
					fn: (input, inStats) => {
						const value = <number>input;
						const stats = <{limit: number}>inStats;

						return value > stats.limit;
					},
					droppedValue: 3,
				},
				select: {
					parent: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
			},
			({input}: {input: {foo: number}}) => {
				return input.foo;
			},
			{
				input: {
					input: new Accessor({
						foo: 'foo',
					}),
				},
			},
		);

		const v1 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([3]);

		const v2 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([2]);

		const v4 = await executor.calculate({ref: 'eins', order: 0}, rank, {
			reference: 'g-2-1',
		});

		expect(v4).to.deep.equal([1]);
	});
});
