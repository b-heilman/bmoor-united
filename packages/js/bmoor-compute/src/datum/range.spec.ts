import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum';
import {DatumRange} from './range';
import {DatumReader} from './reader';

describe('@bmoor/compute - datum/range', function () {
	it('should allow computing a payload with historical data', async function () {
		const datumNow = new Datum('something-now', {
			features: {
				foo: 10,
				bar: 20,
				hello: 30,
				world: 40,
			},
		});

		const datumOffset = new Datum('something-offset', {
			features: {
				foo: 100,
				bar: 200,
				hello: 300,
				world: 400,
			},
		});

		const datumPast = new Datum('something-then', {
			features: {
				foo: 1,
				bar: 2,
				hello: 3,
				world: 4,
			},
		});

		const child = new DatumReader<
			{hello: number; world: number},
			Datum,
			object
		>('hello-world', {
			hello: 'hello',
			world: 'world',
		});

		const top = new DatumRange(
			'foo-bar',
			{
				helloWorld: child,
			},
			{
				range: 4,
				offset: 3,
				strict: false,
				reducer: (values) => {
					return values.reduce(
						(agg, v) => agg + v.helloWorld.hello + v.helloWorld.world,
						0,
					);
				},
			},
		);

		expect(
			await top.process(
				new Context({}),
				{
					range: (datum, depth) => {
						expect(datum).to.equal(datumNow);
						expect(depth).to.equal(4);

						return [datumOffset, datumOffset];
					},
					offset: (datum, shift, strict) => {
						expect(datum).to.equal(datumOffset);
						expect(shift).to.equal(3);
						expect(strict).to.equal(false);

						return datumPast;
					},
					select: () => null,
				},
				[datumNow],
			),
		).to.deep.equal([14]);
	});
});
