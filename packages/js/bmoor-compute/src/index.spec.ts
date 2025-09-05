import {expect} from 'chai';

import {
	DatumAcross,
	DatumCompute,
	DatumOffset,
	DatumRange,
	DatumRanker,
	Executor,
	IntervalDatum,
	IntervalEnvironment,
	IntervalEnvironmentSelector,
	mean,
} from './index.ts';

class Offset<RequirementT> extends DatumOffset<
	RequirementT,
	IntervalDatum,
	IntervalEnvironmentSelector,
	IntervalEnvironment<IntervalEnvironmentSelector>
> {}
class Across<ResponseT, RequirementT> extends DatumAcross<
	ResponseT,
	RequirementT,
	IntervalDatum,
	IntervalEnvironmentSelector,
	IntervalEnvironment<IntervalEnvironmentSelector>
> {}
class Compute<ResponseT, RequirementT> extends DatumCompute<
	ResponseT,
	RequirementT,
	IntervalDatum,
	IntervalEnvironmentSelector,
	IntervalEnvironment<IntervalEnvironmentSelector>
> {}
class Range<ResponseT, RequirementT> extends DatumRange<
	ResponseT,
	RequirementT,
	IntervalDatum,
	IntervalEnvironmentSelector,
	IntervalEnvironment<IntervalEnvironmentSelector>
> {}
class Ranker<RequirementT> extends DatumRanker<
	RequirementT,
	IntervalDatum,
	IntervalEnvironmentSelector,
	IntervalEnvironment<IntervalEnvironmentSelector>
> {}

describe('@bmoor/compute', function () {
	let env: IntervalEnvironment = null;
	let executor: Executor<
		IntervalDatum,
		IntervalEnvironmentSelector,
		IntervalEnvironment<IntervalEnvironmentSelector>
	>;

	let accessFoo;
	let accessFoo1;
	let accessFoo2;
	let proc1;
	let proc2;
	let proc3;
	let proc4;
	let proc5;
	let proc6;
	let proc7;

	beforeEach(function () {
		env = new IntervalEnvironment({
			factory: (interval) => {
				return function (name, settings) {
					if (settings) {
						return new IntervalDatum(name, settings);
					} else {
						return new IntervalDatum(name, {
							interval,
							metadata: {type: 'root'},
							features: {},
						});
					}
				};
			},
			content: {
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
			},
		});

		executor = new Executor<
			IntervalDatum,
			IntervalEnvironmentSelector,
			IntervalEnvironment<IntervalEnvironmentSelector>
		>(env);

		accessFoo = new Offset('get-foo', {value: 'foo'}, {offset: 0});
		accessFoo1 = new Offset('get-foo-1', {value: 'foo'}, {offset: 1});
		accessFoo2 = new Offset('get-foo-2', {value: 'foo'}, {offset: 2});

		// bar1

		proc1 = new Compute<
			number,
			{eins: {value: number}; zwei: {value: number}}
		>(
			'mean-between',
			{
				eins: accessFoo1,
				zwei: accessFoo2,
			},
			{
				offset: 0,
				reducer: (args) => {
					return (args.eins.value + args.zwei.value) / 2;
				},
			},
		);

		proc2 = new Range<number, {mean: number}>(
			'mean-3',
			{
				mean: accessFoo,
			},
			{
				range: 3,
				strict: false,
				offset: 0,
				reducer: mean,
			},
		);

		proc3 = new Compute<number, {arg1: number; arg2: number}>(
			'compared-means',
			{
				arg1: proc1,
				arg2: proc2,
			},
			{
				offset: 2,
				reducer: (data) => {
					return (data.arg1 + data.arg2) / 2;
				},
			},
		);

		proc4 = new Across(
			'p-means',
			{
				mean: accessFoo,
			},
			{
				offset: 0,
				select: {
					metadata: {
						type: 'p',
					},
				},
				reducer: mean,
			},
		);

		proc5 = new Across(
			'p-proc',
			{
				mean: proc2,
			},
			{
				offset: 0,
				select: {
					metadata: {
						type: 'p',
					},
				},
				reducer: mean,
			},
		);

		proc6 = new Across(
			'p-across',
			{
				input: new Offset<{foo: number; bar: number}>(
					'foo-bar',
					{foo: 'foo', bar: 'bar'},
					{offset: 0},
				),
			},
			{
				select: {
					metadata: {
						type: 'p',
					},
				},
				offset: 0,
				reducer: (args: {input: {foo: number; bar: number}}[]) => {
					const rtn =
						args.reduce(
							(agg, {input}) => agg + (input.foo + input.bar) / 2,
							0,
						) / args.length;

					return rtn;
				},
			},
		);

		proc7 = new Range(
			'range',
			{
				mean: proc6,
			},
			{
				range: 3,
				offset: 0,
				reducer: mean,
			},
		);
	});

	it('should work with a simple execution', async function () {
		// access
		const v = await executor.calculate(
			[executor.env.getDatum('g-1', 'drei')],
			accessFoo,
		);
		expect(v).to.deep.equal([{value: 3}]);
	});

	it('should allow you to simply pick the other side', async function () {
		// access
		const v = await executor.calculate(
			[executor.env.getDatum('g-2', 'drei')],
			accessFoo,
		);
		expect(v).to.deep.equal([{value: 30}]);
	});

	it('should work with simple processor', async function () {
		// (10 + 20) / 2
		const v = await executor.calculate(
			[executor.env.getDatum('g-2', 'drei')],
			proc1,
		);
		expect(v).to.deep.equal([15]);
	});

	it('should work with a range execution', async function () {
		// (2 + 3 + 4) / 3
		const v = await executor.calculate(
			[executor.env.getDatum('g-1', 'fier')],
			proc2,
		);
		expect(v).to.deep.equal([3]);
	});

	it('should allow compound calls', async function () {
		// (((4 + 3) / 2) + ((5 + 4 + 3) / 3)) / 2
		const v = await executor.calculate(
			[executor.env.getDatum('g-1', 'sieben')],
			proc3,
		);

		expect(v).to.deep.equal([3.75]);
	});

	it('should allow subcalls', async function () {
		const v = await executor.calculate(
			[executor.env.getDatum('g-1', 'eins')],
			proc4,
		);

		expect(v).to.deep.equal([151]);
	});

	it('should allow compound subcalls', async function () {
		const v = await executor.calculate(
			[executor.env.getDatum('g-2', 'zwei')],
			proc5,
		);

		expect(v).to.deep.equal([165]);
	});

	it('should allow more complex compound subcalls', async function () {
		const v = await executor.calculate(
			[executor.env.getDatum('g-2', 'zwei')],
			proc7,
		);

		expect(v).to.deep.equal([165.25]);
	});

	it('should allow ranking across nodes', async function () {
		const rank = new Ranker<{rank: {foo: number}}>(
			'rank-across-foo',
			{
				rank: new Offset<{foo: number}>(
					'ranker-across-access',
					{
						foo: 'foo',
					},
					{
						offset: 0,
					},
				),
			},
			{
				offset: 0,
				select: {
					parentMetadata: {
						type: 'u',
					},
					metadata: {
						type: 'p',
					},
				},
				reducer: (args: {rank: {foo: number}}) => {
					return args.rank.foo;
				},
			},
		);

		const v1 = await executor.calculate(
			[executor.env.getDatum('g-1-1', 'eins')],
			rank,
		);

		expect(v1).to.deep.equal([1]);

		const v2 = await executor.calculate(
			[executor.env.getDatum('g-1-2', 'eins')],
			rank,
		);

		expect(v2).to.deep.equal([0]);

		const v3 = await executor.calculate(
			[executor.env.getDatum('g-2-2', 'eins')],
			rank,
		);

		expect(v3).to.deep.equal([0]);
	});

	it('should allow ranking across nodes - asc', async function () {
		const rank = new Ranker<{rank: {foo: number}}>(
			'rank-across-foo',
			{
				rank: new Offset<{foo: number}>(
					'ranker-across-access',
					{
						foo: 'foo',
					},
					{
						offset: 0,
					},
				),
			},
			{
				asc: true,
				offset: 0,
				select: {
					parentMetadata: {
						type: 'u',
					},
					metadata: {
						type: 'p',
					},
				},
				reducer: (args: {rank: {foo: number}}) => {
					return args.rank.foo;
				},
			},
		);

		const v1 = await executor.calculate(
			[executor.env.getDatum('g-1-1', 'eins')],
			rank,
		);

		expect(v1).to.deep.equal([0]);

		const v2 = await executor.calculate(
			[executor.env.getDatum('g-1-2', 'eins')],
			rank,
		);

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate(
			[executor.env.getDatum('g-2-2', 'eins')],
			rank,
		);

		expect(v3).to.deep.equal([1]);
	});

	it('should globally allow ranking across nodes', async function () {
		const rank = new Ranker(
			'rank-across-foo',
			{
				rank: new Offset<{foo: number}>(
					'ranker-across-access',
					{
						foo: 'foo',
					},
					{
						offset: 0,
					},
				),
			},
			{
				offset: 0,
				select: {
					parentMetadata: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
				reducer: (args: {rank: {foo: number}}) => {
					return args.rank.foo;
				},
			},
		);

		const v1 = await executor.calculate(
			[executor.env.getDatum('g-1-1', 'eins')],
			rank,
		);

		expect(v1).to.deep.equal([3]);

		const v2 = await executor.calculate(
			[executor.env.getDatum('g-1-2', 'eins')],
			rank,
		);

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate(
			[executor.env.getDatum('g-2-2', 'eins')],
			rank,
		);

		expect(v3).to.deep.equal([0]);
	});

	it('should allow ranking in buckets - bucket count', async function () {
		const rank = new Ranker(
			'rank-bucket-foo',
			{
				rank: new Offset<{foo: number}>(
					'ranker-across-access',
					{
						foo: 'foo',
					},
					{
						offset: 0,
					},
				),
			},
			{
				offset: 0,
				bucketsCount: 2,
				select: {
					parentMetadata: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
				reducer: (args: {rank: {foo: number}}) => {
					return args.rank.foo;
				},
			},
		);

		const v1 = await executor.calculate(
			[executor.env.getDatum('g-1-1', 'eins')],
			rank,
		);

		expect(v1).to.deep.equal([1]);

		const v2 = await executor.calculate(
			[executor.env.getDatum('g-1-2', 'eins')],
			rank,
		);

		expect(v2).to.deep.equal([0]);

		const v3 = await executor.calculate(
			[executor.env.getDatum('g-2-2', 'eins')],
			rank,
		);

		expect(v3).to.deep.equal([0]);

		const v4 = await executor.calculate(
			[executor.env.getDatum('g-2-1', 'eins')],
			rank,
		);

		expect(v4).to.deep.equal([1]);
	});

	it('should allow ranking in buckets - bucket size', async function () {
		const rank = new Ranker(
			'rank-global-foo',
			{
				rank: new Offset<{foo: number}>(
					'ranker-across-access',
					{
						foo: 'foo',
					},
					{
						offset: 0,
					},
				),
			},
			{
				offset: 0,
				asc: true,
				bucketSize: 3,
				select: {
					parentMetadata: {
						type: 'root',
					},
					metadata: {
						type: 'p',
					},
				},
				reducer: (args: {rank: {foo: number}}) => {
					return args.rank.foo;
				},
			},
		);

		const v1 = await executor.calculate(
			[executor.env.getDatum('g-1-1', 'eins')],
			rank,
		);

		expect(v1).to.deep.equal([0]);

		const v2 = await executor.calculate(
			[executor.env.getDatum('g-1-2', 'eins')],
			rank,
		);

		expect(v2).to.deep.equal([0]);

		const v3 = await executor.calculate(
			[executor.env.getDatum('g-2-2', 'eins')],
			rank,
		);

		expect(v3).to.deep.equal([1]);

		const v4 = await executor.calculate(
			[executor.env.getDatum('g-2-1', 'eins')],
			rank,
		);

		expect(v4).to.deep.equal([0]);
	});

	/**
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

		const v1 = await executor.calculate( rank, {
			interval: {ref: 'eins', order: 0},
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([3]);

		const v2 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([2]);

		const v4 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
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

		const v1 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
			reference: 'g-1-1',
		});

		expect(v1).to.deep.equal([3]);

		const v2 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
			reference: 'g-1-2',
		});

		expect(v2).to.deep.equal([1]);

		const v3 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
			reference: 'g-2-2',
		});

		expect(v3).to.deep.equal([2]);

		const v4 = await executor.calculate(rank, {
			interval: {ref: 'eins', order: 0}, 
			reference: 'g-2-1',
		});

		expect(v4).to.deep.equal([1]);
	});
	**/
});
