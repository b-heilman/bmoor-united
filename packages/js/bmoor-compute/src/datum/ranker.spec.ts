import {expect} from 'chai';

import {Context} from '@bmoor/context';

import {Datum} from '../datum';
import {DatumAction} from './action';
import {DatumRanker} from './ranker';

describe('@bmoor/compute - datum/across', function () {
	it('should allow computing group data', async function () {
		const datum1 = new Datum('something-1', {
			features: {
				foo: 101,
				bar: 201,
				hello: 301,
				world: 401,
			},
		});

		const datum2 = new Datum('something-2', {
			features: {
				foo: 102,
				bar: 202,
				hello: 302,
				world: 402,
			},
		});

		const datum3 = new Datum('something-3', {
			features: {
				foo: 103,
				bar: 203,
				hello: 303,
				world: 403,
			},
		});

		const datum4 = new Datum('something-4', {
			features: {
				foo: 104,
				bar: 204,
				hello: 304,
				world: 404,
			},
		});

		const child = new DatumAction<{hello: number; world: number}, object>(
			'hello-world',
			{
				hello: 'hello',
				world: 'world',
			},
		);

		const top = new DatumRanker(
			'foo-bar',
			{
				helloWorld: child,
			},
			{
				select: {
					something: 2,
				},
				offset: 3,
			},
			(v) => v.helloWorld.hello + v.helloWorld.world,
		);

		expect(
			await top.process(
				new Context({}),
				{
					select: (datum, select) => {
						expect(datum).to.equal(datum2);
						expect(select).to.deep.equal({
							something: 2,
						});

						return [datum1, datum4, datum2, datum3];
					},
					offset: (datum, shift, strict) => {
						expect(shift).to.equal(3);
						expect(strict).to.equal(false);

						return datum;
					},
				},
				[datum2],
			),
		).to.deep.equal([2]);

		expect(
			await top.process(
				new Context({}),
				{
					select: (datum, select) => {
						expect(datum).to.equal(datum1);
						expect(select).to.deep.equal({
							something: 2,
						});

						return [datum1, datum4, datum2, datum3];
					},
					offset: (datum, shift, strict) => {
						expect(shift).to.equal(3);
						expect(strict).to.equal(false);

						return datum;
					},
				},
				[datum1],
			),
		).to.deep.equal([3]);

		const inverse = new DatumRanker(
			'foo-bar',
			{
				helloWorld: child,
			},
			{
				asc: true,
				select: {
					something: 2,
				},
				offset: 3,
			},
			(v) => v.helloWorld.hello + v.helloWorld.world,
		);

		expect(
			await inverse.process(
				new Context({}),
				{
					select: (datum, select) => {
						expect(datum).to.equal(datum1);
						expect(select).to.deep.equal({
							something: 2,
						});

						return [datum1, datum4, datum2, datum3];
					},
					offset: (datum, shift, strict) => {
						expect(shift).to.equal(3);
						expect(strict).to.equal(false);

						return datum;
					},
				},
				[datum1],
			),
		).to.deep.equal([0]);
	});
});
