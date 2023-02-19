import {expect} from 'chai';

import {Calculator} from './calculator';
import {Environment} from './environment';
import {Source} from './source';

describe('@bmoor/calculator', function () {
	let env = null;
	let calc = null;

	beforeEach(function () {
		env = new Environment<string, string>({
			add: async (args) => args.reduce((agg, value) => agg + value, 0)
		}, {
			'ref-3': {
				'10': {
					foo: 1,
					bar: 2
				},
				'9': {
					foo: 3,
					bar: 4
				},
				'8': {
					foo: 5,
					bar: 6
				},
				'7': {
					foo: 7,
					bar: 8
				},
				'6': {
					foo: 9,
					bar: 0
				},
				'5': {
					foo: 10,
					bar: 11
				},
			}
		});

		env.setValue('ref-1', '10', 'foo', 12);
		env.setValue('ref-1', '10', 'bar', 34);
		env.setValue('ref-2', '10', 'bar', 56);

		calc = new Calculator<string, string>(
			{
				env,
				src: new Source<string, string>(
					['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
					[],
					async () => {
						return 1;
					},
				),
			},
			[
				{
					mount: 'foo.bar',
					method: 'add',
					args: [
						{
							offset: 0,
							mount: 'foo',
						},
						{
							offset: 0,
							mount: 'bar',
						},
					],
					settings: {},
				},{
					mount: 'foo.bar2',
					method: 'add',
					args: [
						{
							offset: 0,
							mount: 'foo',
						},
						{
							ref: 'ref-2',
							offset: 0,
							mount: 'bar',
						},
					],
					settings: {},
				},{
					mount: 'foo.bar.other',
					method: 'add',
					args: [
						{
							ref: (ref) => ref.split('-')[0]+'-1',
							offset: 0,
							mount: 'foo',
						},
						{
							ref: (ref) => ref.split('-')[0]+'-2',
							offset: 0,
							mount: 'bar',
						},
					],
					settings: {},
				},{
					mount: 'sum-5',
					method: 'add',
					args: [
						{
							offset: 0,
							count: 5,
							mount: 'foo',
						}
					],
					settings: {},
				},{
					mount: 'sum-5-1',
					method: 'add',
					args: [
						{
							offset: 1,
							count: 5,
							mount: 'foo',
						}
					],
					settings: {},
				}
			],
		);
	});

	describe('basic functionality', function () {
		it('should run correctly', async function () {
			expect(await calc.compute('ref-1', '10', 'foo.bar', {})).to.equal(46);
		});

		it('should allow cross references', async function () {
			expect(await calc.compute('ref-1', '10', 'foo.bar2', {})).to.equal(68);
		});

		it('should allow cross via relative reference', async function () {
			expect(await calc.compute('ref-1', '10', 'foo.bar.other')).to.equal(68);
		});

		it('should allow arguments to be flattened', async function () {
			expect(await calc.compute('ref-3', '10', 'sum-5')).to.equal(25);
		});

		it('should allow arguments to be flattened with offset', async function () {
			expect(await calc.compute('ref-3', '10', 'sum-5-1')).to.equal(34);
		});
	});
});
