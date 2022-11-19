import {expect} from 'chai';

import {pretty} from './array';

describe('@bmoor-string/array', function () {
	describe('pretty', function () {
		it('work with length', function () {
			expect(
				pretty(
					[
						{
							foo: 100.111,
							hello: {
								world: 22.222
							}
						},
						{
							foo: 900.999,
							hello: {
								world: 22.888
							}
						}
					],
					{
						separator: ' | ',
						columns: {
							foo: {
								precision: 2,
								length: 8
							},
							'hello.world': {
								align: 'right',
								precision: 2,
								length: 8
							}
						}
					}
				)
			).to.equal(
				'h:\tfoo      | lo.world\n' +
					'0:\t100.11   |    22.22\n' +
					'1:\t901.00   |    22.89'
			);
		});
	});
});
