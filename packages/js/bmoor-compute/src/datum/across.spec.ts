import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum.ts';
import {DatumAcross} from './across.ts';
import {DatumReader} from './reader.ts';

export const results =
	describe('@bmoor/compute - datum/across', function () {
		it('should allow computing group data', async function () {
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

			const top = new DatumAcross(
				'foo-bar',
				{
					helloWorld: child,
				},
				{
					select: {
						something: 2,
					},
					offset: 3,
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
						select: (datum, select) => {
							expect(datum).to.equal(datumNow);
							expect(select).to.deep.equal({
								something: 2,
							});

							return [datumOffset, datumOffset];
						},
						offset: (datum, shift, strict) => {
							expect(datum).to.equal(datumOffset);
							expect(shift).to.equal(3);
							expect(strict).to.equal(false);

							return datumPast;
						},
					},
					[datumNow],
				),
			).to.deep.equal([14]);
		});
	});
