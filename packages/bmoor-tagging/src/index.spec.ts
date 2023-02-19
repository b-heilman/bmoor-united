import {expect} from 'chai';

import {Tagging} from './index';

interface Test {
	foo: string;
	bar: string;
}

describe('@bmoor/tagging', function () {
	describe('base functionality', function () {
		it('should work', function () {
			const tagging = new Tagging<Test>();

			tagging.add(
				{
					foo: 'f-1',
					bar: 'b-1',
				},
				['t-1'],
			);

			tagging.add(
				{
					foo: 'f-2',
					bar: 'b-2',
				},
				['t-2'],
			);

			tagging.add(
				{
					foo: 'f-3',
					bar: 'b-3',
				},
				['t-1', 't-2'],
			);

			expect(tagging.get('t-1')).to.deep.equal([
				{foo: 'f-1', bar: 'b-1'},
				{foo: 'f-3', bar: 'b-3'},
			]);

			expect(tagging.get('t-2')).to.deep.equal([
				{foo: 'f-2', bar: 'b-2'},
				{foo: 'f-3', bar: 'b-3'},
			]);
		});
	});
});
