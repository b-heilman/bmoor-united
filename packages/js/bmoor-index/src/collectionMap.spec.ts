import {expect} from 'chai';

import {CollectionMap} from './collectionMap.ts';

interface Test {
	foo: string;
	bar: string;
}

describe('@bmoor/index', function () {
	describe('CollectionMap', function () {
		it('should work', function () {
			const tagging = new CollectionMap<string, Test>();

			tagging.add(['t-1'], {
				foo: 'f-1',
				bar: 'b-1',
			});

			tagging.add(['t-2'], {
				foo: 'f-2',
				bar: 'b-2',
			});

			tagging.add(['t-1', 't-2'], {
				foo: 'f-3',
				bar: 'b-3',
			});

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
